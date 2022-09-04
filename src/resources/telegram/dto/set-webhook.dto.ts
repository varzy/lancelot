export class SetWebhookDto {
  url: string;

  ip_address?: string;

  max_connections?: number;

  allowed_updates?: string[];

  secret_token?: string;
}
