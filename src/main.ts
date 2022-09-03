import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app');
  const swaggerConfig = configService.get<SwaggerConfig>('swagger');

  /**
   * Setup
   */
  app.setGlobalPrefix('api').useGlobalPipes(new ValidationPipe({ transform: true }));

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
  await app.listen(appConfig.port);

  console.log(`---------------------------------------------`);
  console.log(`APP ENV: ${process.env.APP_ENV}`);
  console.log(`APP RUNNING AT: ${appConfig.port}`);
  console.log(`---------------------------------------------`);
}

bootstrap();
