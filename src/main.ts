import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WsAdapter } from '@nestjs/platform-ws';
import session from 'express-session';
import { AppModule } from './app.module.js';
import { BINDING_PORT } from './constant.js';

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
  );
  
  const config = new DocumentBuilder()
    .setTitle('GMGN Helper')
    .setVersion('1.0')
    .addTag('gmgn')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useWebSocketAdapter(new WsAdapter(app))
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors(
    {
      origin: ['https://gmgn.ai'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    }
  );
  app.use(
    session({
      secret: process.env.SESSION_SECRET_KEY || 'session_secret_key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',  // Secure cookies in production
        maxAge: 1000 * 60 * 60, // 1 hour
      },
    })
  )
  await app.listen(BINDING_PORT);
}
bootstrap();