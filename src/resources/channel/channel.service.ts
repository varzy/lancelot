import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Dayjs } from '../../utils/dayjs';
import { NotionService } from '../notion/notion.service';
import NotionConfig from '../../config/notion.config';
import {
  BlockObjectResponse,
  BulletedListItemBlockObjectResponse,
  CodeBlockObjectResponse,
  NumberedListItemBlockObjectResponse,
  PageObjectResponse,
  ParagraphBlockObjectResponse,
  QuoteBlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { TelegramService } from '../telegram/telegram.service';
import { InputMediaPhoto } from 'telegraf/types';

@Injectable()
export class ChannelService extends NotionService implements OnModuleInit {
  private readonly databaseId: string;

  constructor(protected readonly configService: ConfigService, private readonly telegramService: TelegramService) {
    super(configService);
    const notionConfig = this.configService.get<NotionConfig>('notion');
    this.databaseId = notionConfig.channelDatabaseId;
  }

  onModuleInit() {
    console.log('ChannelService Module Init');
  }

  async publishById(id: string) {
    const pageCtx = await this.getPageCtx(id);
    return this.publishPage(pageCtx as PageObjectResponse);
  }

  async publishByDay(day: string | Date) {
    const pages = await this.notionClient.databases.query({
      database_id: this.databaseId,
      filter: {
        and: [
          {
            property: 'PlanningPublish',
            date: { equals: Dayjs(day).format('YYYY-MM-DD') },
          },
          {
            property: 'Status',
            select: { equals: 'Completed' },
          },
        ],
      },
    });

    if (!pages.results.length) {
      throw new HttpException('no_publishing_page', HttpStatus.BAD_REQUEST);
    }

    // 根据 PubPriority 字段对发送列表进行倒叙排序排列，越大的越靠前
    const sortedResults = pages.results.sort(
      (a, b) => this.getPageProperty(b, 'PubPriority') - this.getPageProperty(a, 'PubPriority'),
    );

    return this.publishPage(sortedResults[0] as PageObjectResponse);
  }

  private async publishPage(pageCtx: PageObjectResponse) {
    if (this.getPageProperty(pageCtx, 'Status').name !== 'Completed') {
      throw new HttpException('status_is_not_completed', HttpStatus.BAD_REQUEST);
    }

    const publishingCovers = this.buildPublishingCovers(pageCtx);
    if (publishingCovers.length > 10) {
      throw new HttpException('covers_too_many', HttpStatus.BAD_REQUEST);
    }

    const publishingContent = await this.buildPublishingContent(pageCtx);
    if (publishingContent.length > 4096) {
      throw new HttpException('content_too_long', HttpStatus.BAD_REQUEST);
    }

    await this.publishToTelegram(publishingCovers, publishingContent);

    await this.updateProperty(pageCtx.id, {
      Status: { select: { name: 'UnNewsletter' } },
      RealPubTime: {
        date: { start: Dayjs().format('YYYY-MM-DD HH:mm:ss'), time_zone: Dayjs.tz.guess() },
      },
    });

    return { pageCtx, publishingCovers, publishingContent };
  }

  private async publishToTelegram(publishingCovers: string[], publishingContent: string) {
    // 无图片
    if (!publishingCovers.length) {
      await this.telegramService.sendMessage(publishingContent, { parse_mode: 'MarkdownV2' });
    }
    // 1 张图片
    else if (publishingCovers.length === 1) {
      await this.telegramService.sendPhoto(publishingCovers[0], {
        parse_mode: 'MarkdownV2',
        caption: publishingContent,
      });
    }
    // 多图
    else {
      const photos: InputMediaPhoto[] = publishingCovers.map((cover, index) => ({
        type: 'photo',
        media: cover,
        parse_mode: 'MarkdownV2',
        caption: index === 0 ? publishingContent : undefined,
      }));
      await this.telegramService.sendMediaGroup(photos);
    }
  }

  private buildPublishingCovers(pageCtx: PageObjectResponse) {
    return this.getPageProperty(pageCtx, 'Cover').map((cover) => cover.file.url);
  }

  private async buildPublishingContent(pageCtx: PageObjectResponse) {
    let publishingContent = '';

    // 添加分类
    const category = this.getPageProperty(pageCtx, 'Category').name;
    if (!category) {
      throw new HttpException('page_no_category', HttpStatus.BAD_REQUEST);
    }
    publishingContent += TelegramService.escapeTextToMarkdownV2(`#${category}`);

    // 添加标签
    const tags = this.getPageProperty(pageCtx, 'Tags')
      .map((tag) => TelegramService.escapeTextToMarkdownV2(`#${tag.name}`))
      .join(' ');
    publishingContent += ` ${tags}`;

    // 添加标题
    if (!this.getPageProperty(pageCtx, 'IsHideTitle')) {
      const icon = this.buildPublishingIcon(pageCtx);
      const title = this.buildPublishingTitle(pageCtx);
      publishingContent += `\n\n${icon} ${title}`;
    }

    // 添加内容
    let numberedOrder = 0;
    const pageBlocks = await this.getFulfilledBlocksList(pageCtx.id);
    const content = (pageBlocks as BlockObjectResponse[])
      .map((block) => {
        // 根据段落类型进行转义
        const supportedBlockTypeProducer = {
          paragraph: this.translateParagraphBlock,
          quote: this.translateQuoteBlock,
          numbered_list_item: this.translateNumberedListItemBlock,
          bulleted_list_item: this.translateBulletedListItemBlock,
          code: this.translateCodeBlock,
        };

        if (!supportedBlockTypeProducer[block.type]) {
          throw new HttpException(`Unsupported Block Type: ${block.type}; BlockCtx: ${block}`, HttpStatus.BAD_REQUEST);
        }

        if (block.type === 'numbered_list_item') {
          numberedOrder++;
          return supportedBlockTypeProducer[block.type].call(this, block, numberedOrder);
        } else {
          numberedOrder = 0;
          return supportedBlockTypeProducer[block.type].call(this, block);
        }
      })
      .join('\n')
      .trim();
    publishingContent += `\n\n${content}`;

    // 添加 Copyright
    if (!this.getPageProperty(pageCtx, 'IsHideCopyright')) {
      publishingContent += `\n\n频道：@AboutZY`;
    }

    return publishingContent;
  }

  private buildPublishingLink(text: string, link: string) {
    return `[${text}](${TelegramService.escapeTextToMarkdownV2(link)})`;
  }

  private buildPublishingIcon(pageCtx: PageObjectResponse) {
    return pageCtx.icon.type === 'emoji' ? pageCtx.icon.emoji : '🤖';
  }

  private buildPublishingTitle(pageCtx: PageObjectResponse) {
    const plainTextTitle = this.getPageProperty(pageCtx, 'Name')
      .map((title) => title.plain_text)
      .join('');
    const escapedTitle = TelegramService.escapeTextToMarkdownV2(plainTextTitle);
    const boldedTitle = `*${escapedTitle}*`;

    return this.getPageProperty(pageCtx, 'TitleLink')
      ? this.buildPublishingLink(boldedTitle, this.getPageProperty(pageCtx, 'TitleLink'))
      : boldedTitle;
  }

  private translateParagraphBlock(block: ParagraphBlockObjectResponse) {
    return block.paragraph.rich_text.map(this.translateRichTextSnippet.bind(this)).join('');
  }

  private translateQuoteBlock(block: QuoteBlockObjectResponse) {
    return block.quote.rich_text
      .map((snippet) => {
        snippet.annotations.underline = true;
        return snippet;
      })
      .map(this.translateRichTextSnippet.bind(this))
      .join('');
  }

  private translateNumberedListItemBlock(block: NumberedListItemBlockObjectResponse, numberedOrder: number) {
    const content = block.numbered_list_item.rich_text.map(this.translateRichTextSnippet.bind(this)).join('');
    return TelegramService.escapeTextToMarkdownV2(`${numberedOrder}. `) + content;
  }

  private translateBulletedListItemBlock(block: BulletedListItemBlockObjectResponse) {
    const content = block.bulleted_list_item.rich_text.map(this.translateRichTextSnippet.bind(this)).join('');
    return TelegramService.escapeTextToMarkdownV2(`- `) + content;
  }

  private translateCodeBlock(block: CodeBlockObjectResponse) {
    const language = block.code.language;
    const startLine = TelegramService.escapeTextToMarkdownV2('```' + language);
    const codeBlock = block.code.rich_text
      .map((snippet) => `\`\`\`${language}\n${snippet.plain_text}\n\`\`\``)
      .join('');
    const endLine = TelegramService.escapeTextToMarkdownV2('```');
    return `${startLine}\n${codeBlock}\n${endLine}`;
  }

  private translateRichTextSnippet(snippet) {
    let finalText = TelegramService.escapeTextToMarkdownV2(snippet.plain_text);

    // 对文字进行基本转义，需要注意转义顺序
    if (snippet.annotations.code) finalText = `\`${finalText}\``;
    if (snippet.annotations.strikethrough) finalText = `~${finalText}~`;
    if (snippet.annotations.italic) finalText = `_${finalText}_`;
    if (snippet.annotations.underline) finalText = `__${finalText}__`;
    if (snippet.annotations.bold) finalText = `*${finalText}*`;

    // For Spider Text
    // finalText = finalText.replaceAll(`\\|\\|`, '||');

    // 如果包含链接
    if (snippet.href) finalText = this.buildPublishingLink(finalText, snippet.href);

    return finalText;
  }
}
