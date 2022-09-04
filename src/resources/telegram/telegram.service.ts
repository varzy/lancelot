import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Telegram } from 'telegraf';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SetWebhookDto } from './dto/set-webhook.dto';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly telegramConfig: TelegramConfig;
  private readonly chatId: string;
  private readonly bot: Telegraf;

  // readonly telegram: Telegram;

  static escapeTextToMarkdownV2(text: string) {
    return text.replace(/[_*[\]()>~`#+\-=|{}.!\\]/g, '\\$&');
  }

  constructor(private readonly configService: ConfigService) {
    this.telegramConfig = this.configService.get<TelegramConfig>('telegram');
    this.chatId = this.telegramConfig.chatId;
    const telegramOptions: { agent?: HttpsProxyAgent } = {};
    if (process.env.APP_PROXY_ADDRESS) telegramOptions.agent = new HttpsProxyAgent(process.env.APP_PROXY_ADDRESS);
    this.bot = new Telegraf(this.telegramConfig.token, { telegram: telegramOptions });
  }

  onModuleInit() {
    this.bot.start((ctx) => ctx.reply('Welcome'));
    this.bot.hears('hi', (ctx) => ctx.reply('Hey there'));
    this.bot.command('oldschool', (ctx) => ctx.reply('Hello'));
    this.bot.on('text', (ctx) => {
      // Explicit usage
      ctx.telegram.sendMessage(ctx.message.chat.id, `Hello ${ctx.state.role}`);

      // Using context shortcut
      ctx.reply(`Hello ${ctx.state.role}`);
    });

    this.bot.launch({ webhook: { domain: 'lancelot.fly.dev' } });

    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }

  setWebhook(setWebhookDto: SetWebhookDto) {
    const { url, ...extra } = setWebhookDto;
    return this.bot.telegram.setWebhook(url, extra);
  }

  getWebhookInfo() {
    return this.bot.telegram.getWebhookInfo();
  }

  getMe() {
    return this.bot.telegram.getMe();
  }

  getChat() {
    return this.bot.telegram.getChat(this.chatId);
  }

  sendMessage(text, extra?) {
    return this.bot.telegram.sendMessage(this.chatId, text, extra);
  }

  sendPhoto(photo, extra?) {
    return this.bot.telegram.sendPhoto(this.chatId, photo, extra);
  }

  sendMediaGroup(media, extra?) {
    return this.bot.telegram.sendMediaGroup(this.chatId, media, extra);
  }

  protected callApiWrapChatId(...params) {
    return (method) => this.bot.telegram.callApi.call(this.bot.telegram, method, { chat_id: this.chatId, ...params });
  }
}
