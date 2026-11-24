import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gol } from './entities/gol.entity.js';
import { GolesService } from './goles.service.js';
import { GolesController } from './goles.controller.js';
import { EquiposModule } from '../equipos/equipos.module.js';
import { PartidosModule } from '../partidos/partidos.module.js';
import { LiguillaModule } from '../liguilla/liguilla.module.js';

// dentro de @Module({ imports: [ ..., PartidosModule ] })

@Module({
  imports: [TypeOrmModule.forFeature([Gol]),
   EquiposModule,
    PartidosModule,
    LiguillaModule,
    ],
  controllers: [GolesController],
  providers: [GolesService],
  exports: [GolesService],
})
export class GolesModule {}

