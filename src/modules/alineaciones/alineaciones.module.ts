import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alineacion } from './entities/alineacion.entity.js';
import { AlineacionesService } from './alineaciones.service.js';
import { AlineacionesController } from './alineaciones.controller.js';
import { EquiposModule } from '../equipos/equipos.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Alineacion]), EquiposModule],
  controllers: [AlineacionesController],
  providers: [AlineacionesService],
  exports: [AlineacionesService],
})
export class AlineacionesModule {}

