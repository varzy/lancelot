import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import AppConfig from './config/app.config';

@Injectable()
export class AppService {
  private appConfig: AppConfig;

  constructor(protected readonly configService: ConfigService) {
    this.appConfig = configService.get<AppConfig>('app');
  }

  getHello(): string {
    return `hello, world | ${process.env.APP_ENV}`;
  }
}
