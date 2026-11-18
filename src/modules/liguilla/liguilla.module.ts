import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiguillaService } from './liguilla.service.js';
import { LiguillaController } from './liguilla.controller.js';
import { Serie } from './entities/serie.entity.js';
import { Partido } from '../partidos/entities/partido.entity.js';
import { Jornada } from '../jornadas/entities/jornada.entity.js';
import { Torneo } from '../torneos/entities/torneo.entity.js';
import { TorneoEquipo } from '../torneo-equipo/entities/torneo-equipo.entity.js';
import { Equipo } from '../equipos/entities/equipo.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Serie,
      Partido,
      Jornada,
      Torneo,
      TorneoEquipo,
      Equipo,
    ]),
  ],
  controllers: [LiguillaController],
  providers: [LiguillaService],
  exports: [LiguillaService],
})
export class LiguillaModule {}