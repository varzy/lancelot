import { Module } from '@nestjs/common';
import { NotionService } from './notion.service';
import { NotionController } from './notion.controller';

@Module({
  controllers: [NotionController],
  providers: [NotionService],
})
export class NotionModule {}
