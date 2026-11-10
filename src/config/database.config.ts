import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from './snake-naming.strategy.js';

export const databaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: Number(configService.get<number>('DB_PORT', 3306)),
  username:
    configService.get<string>('DB_USER') ??
    configService.get<string>('DB_USERNAME', 'root'),
  password:
    configService.get<string>('DB_PASS') ??
    configService.get<string>('DB_PASSWORD', ''),
  database:
    configService.get<string>('DB_NAME') ??
    configService.get<string>('DB_DATABASE', 'Liga_Deportiva'),
  charset: 'utf8mb4_general_ci',
  autoLoadEntities: true,
  synchronize: true,
  namingStrategy: new SnakeNamingStrategy(),
});

