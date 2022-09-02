import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Dayjs from 'dayjs';
import { NotionService } from '../notion/notion.service';
import NotionConfig from '../../config/notion.config';
import {
  BlockObjectResponse,
  PageObjectResponse,
  PartialBlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { TelegramService } from '../../modules/telegram/telegram.service';
import { map } from 'rxjs';

@Injectable()
export class ChannelService extends NotionService {
  private readonly notionConfig: NotionConfig;
  private readonly databaseId: string;

  constructor(protected readonly configService: ConfigService) {
    super(configService);
    this.notionConfig = this.configService.get<NotionConfig>('notion');
    this.databaseId = this.notionConfig.channelDatabaseId;
  }

  async publishById(id: string) {
    const pageCtx = await this.notionClient.pages.retrieve({ page_id: id });
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

  /**
   * 发布页面
   * @param pageCtx
   * @private
   */
  private publishPage(pageCtx: PageObjectResponse) {
    const publishingCovers = this.getPublishingCovers(pageCtx);
    if (publishingCovers.length > 10) {
      throw new Error('Too Many Covers.');
    }

    let publishingContent = '';

    // 添加分类
    const category = this.getPageProperty(pageCtx, 'Category');
    if (!category) {
      throw new Error('No Category.');
    }
    publishingContent += `\\#${category}`;

    // 添加标签
    const tags = this.getPageProperty(pageCtx, 'Tags')
      .map((tag) => `\\#${tag.name}`)
      .join(' ');
    publishingContent += ` ${tags}`;

    // 添加标题
    if (!this.getPageProperty(pageCtx, 'IsHideTitle')) {
      const icon = this.getPublishingIcon(pageCtx);
      const title = this.getPublishingTitle(pageCtx);
      publishingContent += `\n\n${icon} ${title}`;
    }

    // 添加内容
    // const content = await this.getPublishingContent(pageCtx);

    return publishingContent;
  }

  /**
   * 构建发布的封面
   * @param pageCtx
   * @private
   */
  private getPublishingCovers(pageCtx: PageObjectResponse) {
    return this.getPageProperty(pageCtx, 'Cover').map((cover) => cover.file.url);
  }

  /**
   * 构建链接
   * @param text
   * @param link
   * @private
   */
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

        console.log(block);
      })
      .join('\n')
      .trim();
  }

  private translateParagraphBlock(block: BlockObjectResponse) {
    //
  }

  private translateQuoteBlock(block: BlockObjectResponse) {
    //
  }

  private translateNumberedList(block: BlockObjectResponse) {
    //
  }

  private translateBulletedList(block: BlockObjectResponse) {
    //
  }

  private translateCode(block: BlockObjectResponse) {
    //
  }
}
