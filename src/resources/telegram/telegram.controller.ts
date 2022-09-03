import { Controller, Get } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Telegram')
@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Get('me')
  getMe() {
    return this.telegramService.getMe();
  }
}
