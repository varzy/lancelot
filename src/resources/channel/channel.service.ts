import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Dayjs from 'dayjs';
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

  async publishByDay(day?: string) {
    const pages = await this.notionClient.databases.query({
      database_id: this.databaseId,
      filter: {
        and: [
          {
            property: 'PlanningPublish',
            date: { equals: Dayjs(day || new Date()).format('YYYY-MM-DD') },
          },
          {
            property: 'Status',
            select: { equals: 'Completed' },
          },
        ],
      },
    });

    if (!pages.results.length) {
      return { code: 0, message: 'NOTHING_TO_PUBLISH' };
    }

    // 根据 PubPriority 字段对发送列表进行倒叙排序排列，越大的越靠前
    const sortedResults = pages.results.sort(
      (a, b) => this.getPageProperty(b, 'PubPriority') - this.getPageProperty(a, 'PubPriority'),
    );

    return this.publishPage(sortedResults[0] as PageObjectResponse);
  }

  private async publishPage(pageCtx: PageObjectResponse) {
    const publishingCovers = this.buildPublishingCovers(pageCtx);
    if (publishingCovers.length > 10) {
      throw new Error('Covers Too Many.');
    }

    const publishingContent = await this.buildPublishingContent(pageCtx);
    if (publishingContent.length > 4096) {
      throw new Error('Content Too Long.');
    }

    // // 无图片
    // if (!COVERS.length) {
    //   await this.telegramService.sendMessage({ text: TEXT });
    // }
    // // 1 张图片
    // else if (COVERS.length === 1) {
    //   await this.telegramService.sendPhoto({ caption: TEXT, photo: COVERS[0] });
    // }
    // // 多图
    // else {
    //   await this.telegramService.sendPhotoGroup({ type: MediaTypes.PHOTO, media: COVERS });
    // }

    return publishingContent;
  }

  private buildPublishingCovers(pageCtx: PageObjectResponse) {
    return this.getPageProperty(pageCtx, 'Cover').map((cover) => cover.file.url);
  }

  private async buildPublishingContent(pageCtx: PageObjectResponse) {
    let publishingContent = '';

    // 添加分类
    const category = this.getPageProperty(pageCtx, 'Category').name;
    if (!category) {
      throw new Error('No Category.');
    }
    publishingContent += `#${category}`;

    // 添加标签
    const tags = this.getPageProperty(pageCtx, 'Tags')
      .map((tag) => `#${tag.name}`)
      .join(' ');
    publishingContent += ` ${tags}`;

    // 添加标题
    if (!this.getPageProperty(pageCtx, 'IsHideTitle')) {
      const icon = this.getPublishingIcon(pageCtx);
      const title = this.getPublishingTitle(pageCtx);
      publishingContent += `\n\n${icon} ${title}`;
    }

    // 添加内容
    const content = await this.getPublishingContent(pageCtx);
    publishingContent += `\n\n${content}`;

    // 添加 Copyright
    if (!this.getPageProperty(pageCtx, 'IsHideCopyright')) {
      publishingContent += `\n\n频道：@AboutZY`;
    }

    return publishingContent;
  }

  private getPublishingLink(text: string, link: string) {
    return `[${text}](${TelegramService.escapeTextToMarkdownV2(link)})`;
  }

  private getPublishingIcon(pageCtx: PageObjectResponse) {
    return pageCtx.icon.type === 'emoji' ? pageCtx.icon.emoji : '🤖';
  }

  private getPublishingTitle(pageCtx: PageObjectResponse) {
    const plainTextTitle = this.getPageProperty(pageCtx, 'Name')
      .map((title) => title.plain_text)
      .join('');
    const escapedTitle = TelegramService.escapeTextToMarkdownV2(plainTextTitle);
    const boldedTitle = `*${escapedTitle}*`;

    return this.getPageProperty(pageCtx, 'TitleLink')
      ? this.getPublishingLink(boldedTitle, this.getPageProperty(pageCtx, 'TitleLink'))
      : boldedTitle;
  }

  private async getPublishingContent(pageCtx: PageObjectResponse) {
    let numberedOrder = 0;
    const pageBlocks = await this.getFulfilledBlocksList(pageCtx.id);

    return (pageBlocks as BlockObjectResponse[])
      .map((block) => {
        // 根据段落类型进行转义
        const supportedBlockTypeProducer = {
          paragraph: this.translateParagraphBlock,
          quote: this.translateQuoteBlock,
          numbered_list_item: this.translateNumberedList,
          bulleted_list_item: this.translateBulletedList,
          code: this.translateCode,
        };

        if (!supportedBlockTypeProducer[block.type]) {
          throw new Error(`Unsupported Block Type: ${block.type}; BlockCtx: ${block}`);
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
  }

  private translateParagraphBlock(block: ParagraphBlockObjectResponse) {
    return block.paragraph.rich_text.map(this.translateRichTextSnippet).join('');
  }

  private translateQuoteBlock(block: QuoteBlockObjectResponse) {
    return block.quote.rich_text
      .map((snippet) => {
        snippet.annotations.italic = true;
        snippet.annotations.underline = true;
        return snippet;
      })
      .map(this.translateRichTextSnippet)
      .join('');
  }

  private translateNumberedList(block: NumberedListItemBlockObjectResponse, numberedOrder: number) {
    return block.numbered_list_item.rich_text
      .map(this.translateRichTextSnippet)
      .map((text) => TelegramService.escapeTextToMarkdownV2(`${numberedOrder}. ${text}`))
      .join('');
  }

  private translateBulletedList(block: BulletedListItemBlockObjectResponse) {
    return block.bulleted_list_item.rich_text
      .map(this.translateRichTextSnippet)
      .map((text) => TelegramService.escapeTextToMarkdownV2(`- ${text}`))
      .join('');
  }

  private translateCode(block: CodeBlockObjectResponse) {
    const language = block.code.language;
    const startLine = TelegramService.escapeTextToMarkdownV2('```' + language);
    const codeBlock = `\`\`\`${language}\n${block.code.rich_text[0].plain_text}\n\`\`\``;
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
    if (snippet.href) finalText = this.getPublishingLink(finalText, snippet.href);

    return finalText;
  }
}
