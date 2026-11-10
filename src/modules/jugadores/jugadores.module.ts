import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Jugador } from './entities/jugadores.entity.js';
import { JugadoresService } from './jugadores.service.js';
import { JugadoresController } from './jugadores.controller.js';
import { EquiposModule } from '../equipos/equipos.module.js';
import { UploadsModule } from '../../common/uploads/uploads.module.js';


@Module({
  imports: [TypeOrmModule.forFeature([Jugador]), EquiposModule, UploadsModule],
  controllers: [JugadoresController],
  providers: [JugadoresService],
  exports: [JugadoresService],
})
export class JugadoresModule {}