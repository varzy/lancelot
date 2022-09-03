import { registerAs } from '@nestjs/config';

export default registerAs<TelegramConfig>('telegram', () => ({
  token: process.env.TELEGRAM_BOT_TOKEN,
  chatId: process.env.TELEGRAM_CHAT_ID,
}));
