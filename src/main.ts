import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { DatabaseExceptionFilter } from './common/filters/http-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Prefijo global para todas las rutas: /api/...
  app.setGlobalPrefix('api');

  // CORS habilitado para el frontend
  app.enableCors();

  // Validación global de DTOs con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza error si se envían propiedades extras
      transform: true,        // Transforma payloads a instancias del DTO
    }),
  );

  // Filtro global de excepciones HTTP
  app.useGlobalFilters(new DatabaseExceptionFilter());

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  });
  
  

  // Swagger (documentación de la API)
  const config = new DocumentBuilder()
    .setTitle('Liga Deportiva API')
    .setDescription(
      'API REST para la gestión de una liga deportiva de fútbol. ' +
      'Incluye autenticación JWT, gestión de equipos, torneos, alineaciones, goles y posiciones.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Liga Deportiva API corriendo en http://localhost:${port}`);
  console.log(`📚 Swagger docs en http://localhost:${port}/api/docs`);
}

await bootstrap();
