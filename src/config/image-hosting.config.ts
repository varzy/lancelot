import { registerAs } from '@nestjs/config';

export default registerAs<ImageHostingConfig>('image-hosting', () => ({
  smmsToken: process.env.SMMS_TOKEN,
}));
