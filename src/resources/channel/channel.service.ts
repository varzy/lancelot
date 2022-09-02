import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Dayjs from 'dayjs';
import { NotionService } from '../../modules/notion/notion.service';
import NotionConfig from '../../config/notion.config';
import { GetPageResponse, PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { TelegramService } from '../../modules/telegram/telegram.service';

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
    return this.publishPage(pageCtx);
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
      (a, b) => this.getProperty(b, 'PubPriority') - this.getProperty(a, 'PubPriority'),
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

    // 添加标题
    if (!this.getProperty(pageCtx, 'IsHideTitle')) {
      const _title = this.buildTitle(pageCtx);
      publishingContent += `\n\n${_title}`;
    }
  }

  /**
   * 构建发布的封面
   * @param pageCtx
   * @private
   */
  private getPublishingCovers(pageCtx: PageObjectResponse) {
    return this.getProperty(pageCtx, 'Cover').map((cover) => cover.file.url);
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
    if (!pageCtx.icon)

    return icon ? icon.file.url : '';
  }
}
