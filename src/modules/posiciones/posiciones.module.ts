import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Posicion } from './entities/posicion.entity.js';
import { PosicionesService } from './posiciones.service.js';
import { PosicionesController } from './posiciones.controller.js';
import { EquiposModule } from '../equipos/equipos.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Posicion]), EquiposModule],
  controllers: [PosicionesController],
  providers: [PosicionesService],
  exports: [PosicionesService],
})
export class PosicionesModule {}

