import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

import { databaseConfig } from './config/database.config.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

// Módulos de dominio
import { RolesModule } from './modules/roles/roles.module.js';
import { UsuariosModule } from './modules/usuarios/usuarios.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { EquiposModule } from './modules/equipos/equipos.module.js';
import { TorneoEquipoModule } from './modules/torneo-equipo/torneo-equipo.module.js';
import { AlineacionesModule } from './modules/alineaciones/alineaciones.module.js';
import { GolesModule } from './modules/goles/goles.module.js';
import { PosicionesModule } from './modules/posiciones/posiciones.module.js';

// Seeds
import { SeedModule } from './common/seeds/seed.module.js';

// Guards globales
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from './modules/auth/guards/roles.guard.js';

import { SedesModule } from './modules/sedes/sedes.module.js';

@Module({
  imports: [
    // Configuración global (.env)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Base de datos (TypeORM + MySQL)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: databaseConfig,
    }),

    // Módulos de dominio
    RolesModule,
    UsuariosModule,
    AuthModule,
    EquiposModule,
    TorneoEquipoModule,
    AlineacionesModule,
    GolesModule,
    PosicionesModule,
    SedesModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Guard JWT global — todas las rutas requieren autenticación
    // excepto las marcadas con @Public()
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Guard de roles global — verifica @Roles() si está presente
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
