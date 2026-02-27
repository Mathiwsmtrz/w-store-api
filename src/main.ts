import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Store Back API')
    .setDescription('E-commerce backend API documentation')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  const protectSwagger = (req: Request, res: Response, next: NextFunction) => {
    const unauthorized = () => {
      res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Docs"');
      res.status(401).send('Authentication required');
    };

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Basic ')) {
      unauthorized();
      return;
    }

    const encodedCredentials = authHeader.slice(6);
    const decodedCredentials = Buffer.from(
      encodedCredentials,
      'base64',
    ).toString('utf8');
    const [username, password] = decodedCredentials.split(':');

    if (username !== 'admin' || password !== 'admin') {
      unauthorized();
      return;
    }

    next();
  };

  app.use('/docs', protectSwagger);
  app.use('/docs-json', protectSwagger);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 80);
}
void bootstrap();
