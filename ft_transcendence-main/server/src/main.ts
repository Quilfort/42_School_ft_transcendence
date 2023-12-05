import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  
  const imagePath = join(__dirname, '..', '..', 'uploads');
  app.use('/uploads', express.static(imagePath));

  app.enableCors({
	// origin: 'http://localhost:5173', // TODO: keep THIS IN MIND!!! if something breaks with cors, this is da reason
	methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
	credentials: true,
  });

  await app.listen(3000);
}

bootstrap();