import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ChannelModule } from './resources/channel/channel.module';
import { NewsletterModule } from './resources/newsletter/newsletter.module';
import { PosterModule } from './resources/poster/poster.module';
import { DoubanModule } from './resources/douban/douban.module';
import { NotionModule } from './resources/notion/notion.module';
import { TelegramModule } from './resources/telegram/telegram.module';
import appConfig from './config/app.config';
import swaggerConfig from './config/swagger.config';
import notionConfig from './config/notion.config';
import telegramConfig from './config/telegram.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, swaggerConfig, notionConfig, telegramConfig],
    }),
    ChannelModule,
    NewsletterModule,
    PosterModule,
    DoubanModule,
    NotionModule,
    TelegramModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
