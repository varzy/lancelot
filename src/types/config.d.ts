interface AppConfig {
  port: number;
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
