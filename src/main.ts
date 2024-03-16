import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('nestjs/api');
  app.useGlobalPipes(new ValidationPipe());
  app.use(compression());
  app.enableCors({
    origin: '*',
    optionsSuccessStatus: 200,
  })
  app.use(helmet());
  await app.listen(3000);
}
bootstrap();
