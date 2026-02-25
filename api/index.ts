import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp'
import cookieParser from 'cookie-parser';

const expressApp = express();
let isInitialized = false;

async function createNestServer() {
  if (isInitialized) return;

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.use(helmet());
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ limit: '10kb' }));
  app.use(
    hpp({
      whitelist: [],
    }),
  );
  // Enable cookie parser
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  });

  const config = new DocumentBuilder()
    .setTitle('Ecommerce API')
    .setDescription('API documentation for the ecommerce backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs/json',
  });

  await app.init();
  isInitialized = true;
}

export default async (req: any, res: any) => {
  await createNestServer();
  expressApp(req, res);
};
