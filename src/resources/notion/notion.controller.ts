import { Controller, DefaultValuePipe, Get, Param, Query } from '@nestjs/common';
import { NotionService } from './notion.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Notion')
@Controller('notion')
export class NotionController {
  constructor(private readonly notionService: NotionService) {}

  @Get('pages/:id')
  getPageCtx(@Param('id') id: string) {
    return this.notionService.getPageCtx(id);
  }

  @Get('blocks/:id')
  getBlockCtx(@Param('id') id: string) {
    return this.notionService.getBlockCtx(id);
  }

  @Get('blocks/:id/content')
  getBlocksContent(
    @Param('id') id: string,
    @Query('page_size', new DefaultValuePipe(50)) page_size?: number,
    @Query('start_cursor') start_cursor?: string,
  ) {
    return this.notionService.getBlocks({ block_id: id, page_size, start_cursor });
  }

  @Get('blocks/:id/fulfilled')
  getBlocksFulfilled(@Param('id') id: string) {
    return this.notionService.getBlocksFulfilled(id);
  }
}
