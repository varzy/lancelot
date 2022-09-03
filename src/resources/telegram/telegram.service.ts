import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegram } from 'telegraf';
import { HttpsProxyAgent } from 'https-proxy-agent';

@Injectable()
export class TelegramService {
  readonly telegram: Telegram;
  private readonly chatId: string;

  static escapeTextToMarkdownV2(text: string) {
    return text.replace(/[_*[\]()>~`#+\-=|{}.!\\]/g, '\\$&');
  }

  constructor(private readonly configService: ConfigService) {
    const telegramConfig = this.configService.get<TelegramConfig>('telegram');
    const telegramOptions: { agent?: HttpsProxyAgent } = {};
    if (process.env.APP_PROXY_ADDRESS) telegramOptions.agent = new HttpsProxyAgent(process.env.APP_PROXY_ADDRESS);
    this.telegram = new Telegram(telegramConfig.token, telegramOptions);
    this.chatId = telegramConfig.chatId;
  }

  getMe() {
    return this.telegram.getMe();
  }

  getChat() {
    return this.telegram.getChat(this.chatId);
  }

  sendMessage(text, extra?) {
    return this.telegram.sendMessage(this.chatId, text, extra);
  }

  sendPhoto(photo, extra?) {
    return this.telegram.sendPhoto(this.chatId, photo, extra);
  }

  protected callApiWrapChatId(...params) {
    return (method) => this.telegram.callApi.call(this.telegram, method, { chat_id: this.chatId, ...params });
  }
}
