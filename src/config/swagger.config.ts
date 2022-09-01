import { registerAs } from '@nestjs/config';

export default registerAs<SwaggerConfig>('swagger', () => ({
  title: `LANCELOT API`,
  path: `docs`,
  version: '1.0',
}));
