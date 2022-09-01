import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app');
  const swaggerConfig = configService.get<SwaggerConfig>('swagger');

  /**
   * Swagger
   */
  const swaggerDocument = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().setTitle(swaggerConfig.title).setVersion(swaggerConfig.version).build(),
  );
  SwaggerModule.setup(configService.get('swagger.path'), app, swaggerDocument);

  /**
   * Startup
   */
  app
    .setGlobalPrefix('api')
    .useGlobalPipes(new ValidationPipe({ transform: true }))
    .enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });
  await app.listen(appConfig.port);
}
bootstrap();
