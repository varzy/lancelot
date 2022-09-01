import { registerAs } from '@nestjs/config';

export default registerAs<AppConfig>('app', () => ({
  port: +process.env.APP_PORT || 3000,
}));
