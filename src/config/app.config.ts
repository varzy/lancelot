import { registerAs } from '@nestjs/config';

export default registerAs<AppConfig>('app', () => ({
  env: (process.env.APP_ENV || 'dev') as AppEnv,
  port: +process.env.APP_PORT || 3000,
  proxyAddress: process.env.APP_PROXY_ADDRESS,
  corsOrigin: process.env.APP_CORS_ORIGIN,
}));
