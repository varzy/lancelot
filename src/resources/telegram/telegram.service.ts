import { Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramService {
  private readonly tgBot: TelegramBot;

  static escapeTextToMarkdownV2(text: string) {
    return text.replace(/[_*[\]()>~`#+\-=|{}.!\\]/g, '\\$&');
  }

  constructor(private readonly configService: ConfigService) {
    const telegramConfig = this.configService.get<TelegramConfig>('telegram');
    this.tgBot = new TelegramBot(telegramConfig.token);
  }

  getMe() {
    return this.tgBot.getMe();
  }
}
