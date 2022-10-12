import { registerAs } from '@nestjs/config';

export default registerAs<NotionConfig>('notion', () => ({
  token: process.env.NOTION_AUTH_TOKEN,
  channelDatabaseId: process.env.NOTION_CHANNEL_DATABASE_ID,
  newsletterDatabaseId: process.env.NOTION_NEWSLETTER_DATABASE_ID,
}));
