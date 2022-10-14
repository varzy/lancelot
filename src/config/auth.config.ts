import { registerAs } from '@nestjs/config';

export default registerAs<AuthConfig>('auth', () => ({
  superUsername: process.env.AUTH_SUPER_USERNAME,
  superPassword: process.env.AUTH_SUPER_PASSWORD,
  jwtSecret: process.env.AUTH_JWT_SECRET,
}));
