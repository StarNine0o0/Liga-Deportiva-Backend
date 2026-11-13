import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipo } from './entities/equipo.entity.js';
import { EquiposService } from './equipos.service.js';
import { EquiposController } from './equipos.controller.js';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { UploadsModule } from '../../common/uploads/uploads.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Equipo]),
  UsuariosModule,
  UploadsModule],  
  controllers: [EquiposController],
  providers: [EquiposService],
  exports: [EquiposService],
})
export class EquiposModule {}

