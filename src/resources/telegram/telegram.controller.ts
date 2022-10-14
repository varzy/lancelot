import { Body, Controller, Get, HttpCode, Logger, Post, UseGuards } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SetWebhookDto } from './dto/set-webhook.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Telegram')
@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('getMe')
  getMe() {
    return this.telegramService.getMe();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('getChat')
  getChat() {
    return this.telegramService.getChat();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('setWebhook')
  setWebhook(@Body() setWebhookDto: SetWebhookDto) {
    return this.telegramService.setWebhook(setWebhookDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('getWebhookInfo')
  getWebhookInfo() {
    return this.telegramService.getWebhookInfo();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('receiveWebhook')
  @HttpCode(200)
  receiveWebhook(@Body() body) {
    Logger.log(JSON.stringify(body), 'Telegram ReceiveWebhook');
    return true;
  }
}
