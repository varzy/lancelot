import { Module } from '@nestjs/common';
import { ImageHostingService } from './image-hosting.service';
import { ImageHostingController } from './image-hosting.controller';
import { HttpModule, HttpModuleOptions } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Url from 'url-parse';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const options: HttpModuleOptions = {
          baseURL: 'https://sm.ms/api/v2/',
          timeout: 50000,
          headers: { Authorization: configService.get('image-hosting.smmsToken') },
        };
        if (process.env.APP_PROXY_ADDRESS) {
          const { protocol, hostname, port } = new Url(process.env.APP_PROXY_ADDRESS);
          options.proxy = { protocol, host: hostname, port: +port };
        }
        return options;
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [ImageHostingController],
  providers: [ImageHostingService],
})
export class ImageHostingModule {}
