import { Body, Controller, Get, Post } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { ApiTags } from '@nestjs/swagger';
import { SetWebhookDto } from './dto/set-webhook.dto';
import { Update, WebhookInfo } from 'node-telegram-bot-api';

@ApiTags('Telegram')
@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Get('getMe')
  getMe() {
    return this.telegramService.getMe();
  }

  @Get('getChat')
  getChat() {
    return this.telegramService.getChat();
  }

  @Post('setWebhook')
  setWebhook(@Body() setWebhookDto: SetWebhookDto) {
    return this.telegramService.setWebhook(setWebhookDto);
  }

  @Post('receiveWebhookInfo')
  receiveWebhookInfo(@Body() webhookInfo: WebhookInfo) {
    return this.telegramService.getWebhookInfo(webhookInfo);
  }
}
