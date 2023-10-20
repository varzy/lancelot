import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { ChannelModule } from './resources/channel/channel.module';
import { NewsletterModule } from './resources/newsletter/newsletter.module';
import { PosterModule } from './resources/poster/poster.module';
import { DoubanModule } from './resources/douban/douban.module';
import { NotionModule } from './resources/notion/notion.module';
import { TelegramModule } from './resources/telegram/telegram.module';
import { ImageHostingModule } from './resources/image-hosting/image-hosting.module';
import { AuthModule } from './resources/auth/auth.module';
import { UsersModule } from './resources/users/users.module';
import appConfig from './config/app.config';
import swaggerConfig from './config/swagger.config';
import notionConfig from './config/notion.config';
import telegramConfig from './config/telegram.config';
import imageHostingConfig from './config/image-hosting.config';
import authConfig from './config/auth.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, swaggerConfig, notionConfig, telegramConfig, imageHostingConfig, authConfig],
    }),
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    ChannelModule,
    NewsletterModule,
    PosterModule,
    DoubanModule,
    NotionModule,
    TelegramModule,
    ImageHostingModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
