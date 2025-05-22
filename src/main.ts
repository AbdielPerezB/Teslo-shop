import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api')

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions:{
        exposeUnsetFields: false,
        enableImplicitConversion: false //en esta ocuación hacemos la transformación de otra manera. En pagination.dto
      },
      // transform: true
    })
  )
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
