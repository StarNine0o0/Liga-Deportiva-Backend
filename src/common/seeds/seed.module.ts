import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service.js';
import { Rol } from '../../modules/roles/entities/rol.entity.js';
import { Usuario } from '../../modules/usuarios/entities/usuario.entity.js';
import { Equipo } from '../../modules/equipos/entities/equipo.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Rol, Usuario, Equipo])],
  providers: [SeedService],
})
export class SeedModule {}