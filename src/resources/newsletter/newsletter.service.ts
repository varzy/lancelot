import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotionService } from '../notion/notion.service';
import { GenerateNewsletterDto } from './dto/generate-newsletter.dto';
import NotionConfig from '../../config/notion.config';
import { Dayjs } from '../../utils/dayjs';
import { BlockObjectResponse, PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { PublishNewsletterDto } from './dto/publish-newsletter.dto';
import * as fs from 'fs';

@Injectable()
export class NewsletterService extends NotionService {
  private readonly channelDatabaseId: string;
  private readonly newsletterDatabaseId: string;

  constructor(protected readonly configService: ConfigService) {
    super(configService);
    const notionConfig = this.configService.get<NotionConfig>('notion');
    this.channelDatabaseId = notionConfig.channelDatabaseId;
    this.newsletterDatabaseId = notionConfig.newsletterDatabaseId;
  }

  async generate(generateNewsletterDto: GenerateNewsletterDto) {
    // 获取准备发布的 posts
    const now = new Date();
    const startTime = Dayjs(generateNewsletterDto.start_time || now).subtract(14, 'day');
    const endTime = Dayjs(generateNewsletterDto.end_time || now);
    const publishingPosts = await this.getPublishingPosts(startTime, endTime);

    if (!publishingPosts) return new HttpException('nothing_to_build_newsletter', HttpStatus.BAD_REQUEST);

    // 创建新的 newsletter 页面
    const newsletterPageCtx = await this.createNewNewsletterPage(publishingPosts as PageObjectResponse[]);

    // 插入目录
    await this.insertTableOfContents(newsletterPageCtx as PageObjectResponse);
    // 插入序言
    await this.insertPreface(newsletterPageCtx as PageObjectResponse);
    // 插入本周分享
    await this.insertSharedContents(newsletterPageCtx as PageObjectResponse, publishingPosts as PageObjectResponse[]);
    // 插入 One More Thing
    // await this.insertOneMoreThing(newsletterPageCtx as PageObjectResponse);
    // 插入友情链接
    await this.insertFriendlyLinks(newsletterPageCtx as PageObjectResponse);
    // 插入 copyright
    await this.insertCopyright(newsletterPageCtx as PageObjectResponse);

    return { code: 0, message: 'GENERATED' };
  }

  async publish(publishNewsletterDto: PublishNewsletterDto) {
    // 获取要发布的 id。如果目标 newsletterId 不存在，则自动取列表中未发布的最后一个
    let targetNewsletterId = publishNewsletterDto.id;
    if (!targetNewsletterId) {
      const unpublishedNewsletters = await this.notionClient.databases.query({
        database_id: this.newsletterDatabaseId,
        filter: {
          property: 'IsPublished',
          checkbox: { equals: false },
        },
      });
      const sortedNewsletters = unpublishedNewsletters.results.sort(
        (a, b) =>
          +new Date(this.getPageProperty(b, 'CreatedAt').start) - +new Date(this.getPageProperty(b, 'CreatedAt').start),
      );
      if (!sortedNewsletters.length) return new HttpException('noting_to_publish', HttpStatus.BAD_REQUEST);
      targetNewsletterId = sortedNewsletters[0].id;
    }

    Logger.log(`Ready to Publish NewsletterId: ${targetNewsletterId}`);

    // 获取页面信息
    const pageCtx = await this.getPageCtx(targetNewsletterId);

    // 更新此 newsletter 关联的 channel post 状态
    for (const post of this.getPageProperty(pageCtx, 'RelatedToChannelPosts')) {
      await this.notionClient.pages.update({
        page_id: targetNewsletterId,
        properties: {
          Status: { select: { name: 'Published' } },
        },
      });
      Logger.log(`RelatedToChannelPost Status Updated: ${post.id}`);
    }
    Logger.log(`RelatedToChannelPosts Statuses All Updated`);

    // 更新此 newsletter 的自身发布状态
    await this.notionClient.pages.update({
      page_id: targetNewsletterId,
      properties: {
        IsPublished: { checkbox: true },
      },
    });

    Logger.log(`Newsletter IsPublished checkbox has been Checked`);

    return { targetNewsletterId };
  }

  /**
   * Notion Api 无法按照时间范围进行过滤，因此先取出全部页面，在本地进行过滤
   */
  private async getPublishingPosts(startTime: Dayjs.Dayjs, endTime: Dayjs.Dayjs) {
    const unNewsletterPosts = await this.notionClient.databases.query({
      database_id: this.channelDatabaseId,
      page_size: 100,
      filter: { property: 'Status', select: { equals: 'UnNewsletter' } },
    });

    return unNewsletterPosts.results
      .filter((post) => {
        const realPubTime = Dayjs(this.getPageProperty(post, 'RealPubTime').start);
        return realPubTime.isSameOrBefore(endTime) && realPubTime.isSameOrAfter(startTime);
      })
      .sort(
        (a, b) =>
          +new Date(this.getPageProperty(a, 'RealPubTime').start) -
          +new Date(this.getPageProperty(b, 'RealPubTime').start),
      )
      .sort(
        (a, b) =>
          this.getPageProperty(a, 'NLGenPriority') || Infinity - this.getPageProperty(b, 'NLGenPriority') || Infinity,
      );
  }

  /**
   *  创建新一期的 newsletter 页面，并且自动生成期号和标题
   */
  private async createNewNewsletterPage(publishingPosts: PageObjectResponse[]) {
    const publishedPages = await this.notionClient.databases.query({
      // ============ 获取期号 ============
      database_id: this.newsletterDatabaseId,
      filter: { property: 'IsPublished', checkbox: { equals: true } },
      sorts: [{ property: 'CreatedAt', direction: 'descending' }],
    });
    const latestPage = publishedPages.results[0];
    const latestNO = latestPage ? this.getPageProperty(latestPage, 'NO') : 0;
    // 考虑到可能存在 .5 期的情况，因此向下取整
    const currentNO = Math.floor(latestNO) + 1;

    // ============ 生成标题 ============
    let pageEmoji;
    const pageTitle = publishingPosts
      .map((post) => {
        if (!pageEmoji && post.icon.type === 'emoji') pageEmoji = post.icon.emoji;
        return this.getPageProperty(post, 'Name')
          .map((title) => title.plain_text)
          .join('');
      })
      .join('、')
      .replaceAll('《', '')
      .replaceAll('》', '');

    return await this.notionClient.pages.create({
      parent: { database_id: this.newsletterDatabaseId },
      icon: { type: 'emoji', emoji: pageEmoji || '😃' },
      properties: {
        Name: {
          title: [
            {
              text: { content: `#${currentNO}｜${pageTitle}` },
            },
          ],
        },
        NO: { number: latestNO + 1 },
        RelatedToChannelPosts: {
          relation: publishingPosts.map((post) => ({ id: post.id })),
        },
        // CreatedAt: {
        //   date: {
        //     start: Dayjs().format('YYYY-MM-DD hh:mm:ss'),
        //     time_zone: 'Asia/Shanghai',
        //     // time_zone: Dayjs.tz('')
        //     // time_zone: null,
        //   },
        // },
      },
    });
  }

  private async insertTableOfContents(newsletterPageCtx: PageObjectResponse) {
    await this.insertBlocks(newsletterPageCtx.id, [
      this.buildBlock('table_of_contents', { color: 'gray_background' }),
      this.buildBlock('paragraph', { rich_text: [] }),
    ]);
  }

  private async insertPreface(newsletterPageCtx: PageObjectResponse) {
    await this.insertBlocks(newsletterPageCtx.id, [
      // 第一段
      this.buildBlock('paragraph', {
        rich_text: [this.buildBlock('text', { content: '见信好👋！' })],
      }),
      // 第二段
      this.buildBlock('paragraph', {
        rich_text: [
          this.buildBlock('text', { content: '「不正集」是一档由 ' }),
          this.buildBlock('text', { content: 'ZY', link: { url: 'https://varzy.me' } }),
          this.buildBlock('text', {
            content: ' 维护的个人 Newsletter，聚焦且不止步于有趣的互联网内容，不定期更新。',
          }),
          // this.buildBlock('text', {
          //   content: '贼歪说',
          //   link: { url: 'https://t.me/aboutzy' },
          // }),
          // this.buildBlock('text', {
          //   content: ' 基本同步。除此之外我还会不定期更新一些 Bonus 内容。',
          // }),
        ],
      }),
      // 第三段
      // this.buildBlock('paragraph', {
      //   rich_text: [
      //     this.buildBlock('text', {
      //       content: `本期是「常规更新」，收录了贼歪说从 ${startTime} 至 ${endTime} 的更新内容。`,
      //     }),
      //   ],
      // }),
    ]);
  }

  private async insertSharedContents(newsletterPageCtx: PageObjectResponse, publishingPosts: PageObjectResponse[]) {
    // ======== 插入大标题 ========
    await this.insertBlocks(newsletterPageCtx.id, this.buildBlocksSectionHeader('本周分享'));

    // ======== 插入 Post 页面 ========
    for (const post of publishingPosts) {
      // Page Title. Block || null
      const PAGE_TITLE = this.buildBlockTitle(post);
      // Page Tags. Block || null
      const PAGE_TAGS = this.buildBlockTags(post);
      // Page Cover. Block || null
      const PAGE_COVER = await this.buildBlockFirstCover(post);
      // Page Content. Block[] || null
      const PAGE_CONTENT = await this.buildBlocksContent(post);

      // 组装
      let CHILDREN = [];
      if (PAGE_TITLE) CHILDREN = [...CHILDREN, PAGE_TITLE];
      if (PAGE_TAGS) CHILDREN = [...CHILDREN, PAGE_TAGS];
      if (PAGE_COVER) CHILDREN = [...CHILDREN, PAGE_COVER];
      if (PAGE_CONTENT) CHILDREN = [...CHILDREN, ...PAGE_CONTENT];

      await this.insertBlocks(newsletterPageCtx.id, CHILDREN);
    }
  }

  async insertFriendlyLinks(newsletterPageCtx: PageObjectResponse) {
    await this.insertBlocks(newsletterPageCtx.id, [
      ...this.buildBlocksSectionHeader('友情链接'),
      this.buildBlock('paragraph', {
        rich_text: [this.buildBlock('text', { content: '广告位免费出租中... 欢迎互换友链🔗。' })],
      }),
    ]);
  }

  async insertCopyright(newsletterPageCtx: PageObjectResponse) {
    const children = [
      // 分割线
      this.buildBlock('divider', {}),
      // 第一段
      this.buildBlock('paragraph', {
        rich_text: [
          this.buildBlock('text', {
            content: '以上就是本期「不正集」的全部内容，喜欢的话可以转发或推荐给您的朋友。',
          }),
        ],
      }),
      // 第二段
      this.buildBlock('paragraph', {
        rich_text: [
          this.buildBlock('text', { content: '订阅地址：' }),
          this.buildBlock('text', {
            content: 'varzy.zhubai.love',
            link: { url: 'https://varzy.zhubai.love' },
          }),
          this.buildBlock('text', { content: '｜个人主页：' }),
          this.buildBlock('text', {
            content: 'varzy.me',
            link: { url: 'https://varzy.me' },
          }),
        ],
      }),
      // 第三段
      this.buildBlock('paragraph', {
        rich_text: [this.buildBlock('text', { content: 'Thanks for Reading💗' })],
      }),
    ];
    await this.insertBlocks(newsletterPageCtx.id, children);
  }

  private async insertBlocks(newsletterPageId: string, children) {
    try {
      await this.notionClient.blocks.children.append({ block_id: newsletterPageId, children });
      // logger.info(`Insert Blocks: Success: ${label}`);
    } catch (e) {
      // logger.error(`Insert Blocks: Error: ${label}: ${e}`);
    }
  }

  private buildBlocksSectionHeader(title) {
    return [
      this.buildBlock('divider', {}),
      this.buildBlock('heading_1', {
        rich_text: [{ type: 'text', text: { content: `「${title}」` } }],
      }),
    ];
  }

  // 很不幸，Notion 目前并不支持直接引用已上传到 Notion 中的图片，因此只能把封面图先下载，再上传，托管于图床
  async buildBlockFirstCover(page) {
    const firstCover = this.getPageProperty(page, 'Cover')[0];
    if (!firstCover) return null;

    return this.buildBlock('image', {
      type: 'file',
      file: { url: firstCover },
    });

    // const firstCover = this.getPageProperty(page, 'Cover')[0];
    //
    // if (!firstCover) return null;
    //
    // const imageHosting = new ImageHosting();
    // await imageHosting.init();
    // const hostingUrl = await imageHosting.uploadExternal(firstCover.file.url);
    //
    // return this.buildBlock('image', {
    //   type: 'external',
    //   external: { url: hostingUrl },
    // });
  }

  buildBlockTitle(page) {
    const pageTitleRichText = [];
    if (page.icon) pageTitleRichText.push({ type: 'text', text: { content: page.icon?.emoji + ' ' } });

    const _title: any = this.buildBlock('text', {
      content: page.properties.Name.title.map((title) => title.plain_text).join(''),
    });
    if (page.properties.TitleLink.url) _title.text.link = { url: page.properties.TitleLink.url };
    pageTitleRichText.push(_title);

    return this.buildBlock('heading_2', { rich_text: pageTitleRichText });
  }

  buildBlockTags(page) {
    const category = this.getPageProperty(page, 'Category').name;
    const tags = this.getPageProperty(page, 'Tags').map((tag) => tag.name);
    const tagsContent = [category, ...tags].map((tag) => `#${tag}`).join(' ');

    return this.buildBlock('paragraph', {
      rich_text: [
        {
          type: 'text',
          text: { content: tagsContent },
          annotations: { italic: true },
        },
      ],
      color: 'gray',
    });
  }

  // @TODO: 根据不同类型生成不同格式
  async buildBlocksContent(page) {
    const pageBlocks = await this.getBlocksFulfilled(page.id);
    return (
      (pageBlocks.results as BlockObjectResponse[])
        // 过滤空白区块
        .filter((block) => !(block.type === 'paragraph' && !block.paragraph.rich_text.length))
        .map((block) => ({
          type: block.type,
          [block.type]: block[block.type],
        }))
    );
  }
}
