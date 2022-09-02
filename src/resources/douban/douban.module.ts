import { Module } from '@nestjs/common';
import { DoubanService } from './douban.service';
import { DoubanController } from './douban.controller';

@Module({
  controllers: [DoubanController],
  providers: [DoubanService],
})
export class DoubanModule {}
