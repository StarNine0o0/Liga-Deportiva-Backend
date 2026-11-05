import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partido } from './entities/partido.entity.js';
import { PartidosService } from './partidos.service.js';
import { PartidosController } from './partidos.controller.js';
import { JornadasModule } from '../jornadas/jornadas.module.js';
import { EquiposModule } from '../equipos/equipos.module.js';
import { SedesModule } from '../sedes/sedes.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Partido]),
    JornadasModule,
    EquiposModule,
    SedesModule,
  ],
  controllers: [PartidosController],
  providers: [PartidosService],
  exports: [PartidosService],
})
export class PartidosModule {}