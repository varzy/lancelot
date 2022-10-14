import { Controller, DefaultValuePipe, Get, Param, Query, UseGuards } from '@nestjs/common';
import { NotionService } from './notion.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Notion')
@Controller('notion')
export class NotionController {
  constructor(private readonly notionService: NotionService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('pages/:id')
  getPageCtx(@Param('id') id: string) {
    return this.notionService.getPageCtx(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('blocks/:id')
  getBlockCtx(@Param('id') id: string) {
    return this.notionService.getBlockCtx(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('blocks/:id/content')
  getBlocksContent(
    @Param('id') id: string,
    @Query('page_size', new DefaultValuePipe(50)) page_size?: number,
    @Query('start_cursor') start_cursor?: string,
  ) {
    return this.notionService.getBlocks({ block_id: id, page_size, start_cursor });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('blocks/:id/fulfilled')
  getBlocksFulfilled(@Param('id') id: string) {
    return this.notionService.getBlocksFulfilled(id);
  }
}
