enum AppEnv {
  dev = 'dev',
  prod = 'prod',
}

interface AppConfig {
  env: AppEnv;
  port: number;
  proxyAddress: string;
  corsOrigin: string;
}

interface SwaggerConfig {
  title: string;
  path: string;
  version: string;
}

interface NotionConfig {
  token: string;
  channelDatabaseId: string;
  newsletterDatabaseId: string;
}

interface TelegramConfig {
  token: string;
  chatId: string;
}

interface ImageHostingConfig {
  smmsToken: string;
}

interface AuthConfig {
  superUsername: string;
  superPassword: string;
  jwtSecret: string;
}
