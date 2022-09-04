import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Telegram } from 'telegraf';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SetWebhookDto } from './dto/set-webhook.dto';
import { Update } from 'node-telegram-bot-api';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly telegramConfig: TelegramConfig;
  readonly telegram: Telegram;
  private readonly chatId: string;

  static escapeTextToMarkdownV2(text: string) {
    return text.replace(/[_*[\]()>~`#+\-=|{}.!\\]/g, '\\$&');
  }

  constructor(private readonly configService: ConfigService) {
    this.telegramConfig = this.configService.get<TelegramConfig>('telegram');
    const telegramOptions: { agent?: HttpsProxyAgent } = {};
    if (process.env.APP_PROXY_ADDRESS) telegramOptions.agent = new HttpsProxyAgent(process.env.APP_PROXY_ADDRESS);
    this.telegram = new Telegram(this.telegramConfig.token, telegramOptions);
    this.chatId = this.telegramConfig.chatId;
  }

  onModuleInit() {
    const bot = new Telegraf(this.telegramConfig.token);
    bot.start((ctx) => ctx.reply('Welcome'));
    bot.hears('hi', (ctx) => ctx.reply('Hey there'));

    bot.launch();
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  }

  setWebhook(setWebhookDto: SetWebhookDto) {
    const { url, ...extra } = setWebhookDto;
    return this.telegram.setWebhook(url, extra);
  }

  getWebhookUpdate(update: Update) {
    console.log('getWebhookUpdate: ');
    console.log(update);
    return update;
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

  sendMediaGroup(media, extra?) {
    return this.telegram.sendMediaGroup(this.chatId, media, extra);
  }

  protected callApiWrapChatId(...params) {
    return (method) => this.telegram.callApi.call(this.telegram, method, { chat_id: this.chatId, ...params });
  }
}
