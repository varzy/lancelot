import { Injectable } from '@nestjs/common';
import { Client as NotionClient } from '@notionhq/client';
import { ConfigService } from '@nestjs/config';
import {
  GetPageResponse,
  ListBlockChildrenParameters,
  ListBlockChildrenResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { ClientOptions } from '@notionhq/client/build/src/Client';

// import { HttpsProxyAgent } from 'https-proxy-agent';

@Injectable()
export class NotionService {
  protected readonly notionClient: NotionClient;

  constructor(protected readonly configService: ConfigService) {
    const notionConfig = this.configService.get<NotionConfig>('notion');
    const options: ClientOptions = { auth: notionConfig.token };
    if (process.env.APP_PROXY_ADDRESS) options.agent = new HttpsProxyAgent(process.env.APP_PROXY_ADDRESS);
    this.notionClient = new NotionClient(options);
  }

  getPageCtx(id: string) {
    return this.notionClient.pages.retrieve({ page_id: id });
  }

  getPageProperty(pageCtx: GetPageResponse, property: string) {
    const type = pageCtx['properties'][property].type;
    return pageCtx['properties'][property][type];
  }

  getBlockCtx(id: string) {
    return this.notionClient.blocks.retrieve({ block_id: id });
  }

  getBlocks(query: ListBlockChildrenParameters) {
    return this.notionClient.blocks.children.list(query);
  }

  async getBlocksFulfilled(blockOrPageId: string) {
    let blocksCtx: ListBlockChildrenResponse;

    const fillBlocks = async (start_cursor?: string) => {
      const resBlocks = await this.getBlocks({ block_id: blockOrPageId, page_size: 100, start_cursor });
      if (!blocksCtx) {
        blocksCtx = resBlocks;
      } else {
        blocksCtx.results = [...blocksCtx.results, ...resBlocks.results];
      }

      if (resBlocks.has_more) {
        await fillBlocks(resBlocks.next_cursor);
      } else {
        blocksCtx.next_cursor = null;
        blocksCtx.has_more = false;
      }
    };
    await fillBlocks();

    return blocksCtx;
  }

  async getFulfilledBlocksList(blockOrPageId: string) {
    const blocksCtx = await this.getBlocksFulfilled(blockOrPageId);
    return blocksCtx.results;
  }

  async updateProperty(pageId: string, properties: Record<string, any>) {
    return this.notionClient.pages.update({ page_id: pageId, properties });
  }

  buildBlock(type, ctx, rootProps = {}) {
    return {
      type,
      [type]: ctx,
      ...rootProps,
    };
  }
}
