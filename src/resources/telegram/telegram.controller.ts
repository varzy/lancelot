import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { ApiTags } from '@nestjs/swagger';
import { SetWebhookDto } from './dto/set-webhook.dto';

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

  @Get('getWebhookInfo')
  getWebhookInfo() {
    return this.telegramService.getWebhookInfo();
  }

  @Post('receiveWebhook')
  @HttpCode(200)
  receiveWebhook(@Body() body) {
    Logger.log(JSON.stringify(body), 'Telegram ReceiveWebhook');
    return true;
  }
}
