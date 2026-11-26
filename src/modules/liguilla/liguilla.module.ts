import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiguillaService } from './liguilla.service.js';
import { LiguillaController } from './liguilla.controller.js';
import { Serie } from './entities/serie.entity.js';
import { Jornada } from '../jornadas/entities/jornada.entity.js';
import { Torneo } from '../torneos/entities/torneo.entity.js';
import { TorneoEquipo } from '../torneo-equipo/entities/torneo-equipo.entity.js';
import { Equipo } from '../equipos/entities/equipo.entity.js';
import { PartidosModule } from '../partidos/partidos.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Serie,
      Jornada,
      Torneo,
      TorneoEquipo,
      Equipo,
    ]),
    forwardRef(() => PartidosModule),
  ],
  controllers: [LiguillaController],
  providers: [LiguillaService],
  exports: [LiguillaService],
})
export class LiguillaModule {}