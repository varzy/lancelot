import { Injectable } from '@nestjs/common';

@Injectable()
export class TelegramService {
  static escapeTextToMarkdownV2(text: string) {
    return text.replace(/[_*[\]()>~`#+\-=|{}.!\\]/g, '\\$&');
  }
}
