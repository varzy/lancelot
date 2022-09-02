import { Injectable } from '@nestjs/common';
import { Client as NotionClient } from '@notionhq/client';
import { ConfigService } from '@nestjs/config';
import { GetPageResponse } from '@notionhq/client/build/src/api-endpoints';

@Injectable()
export class NotionService {
  protected readonly notionClient: NotionClient;

  constructor(protected readonly configService: ConfigService) {
    const notionConfig = this.configService.get<NotionConfig>('notion');
    this.notionClient = new NotionClient({ auth: notionConfig.token });
  }

  getProperty(pageCtx: GetPageResponse, property: string) {
    const type = pageCtx['properties'][property].type;
    return pageCtx['properties'][property][type];
  }
}
