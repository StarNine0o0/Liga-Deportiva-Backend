import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TorneoEquipo } from './entities/torneo-equipo.entity.js';
import { TorneoEquipoService } from './torneo-equipo.service.js';
import { TorneoEquipoController } from './torneo-equipo.controller.js';
import { EquiposModule } from '../equipos/equipos.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([TorneoEquipo]), EquiposModule],
  controllers: [TorneoEquipoController],
  providers: [TorneoEquipoService],
  exports: [TorneoEquipoService],
})
export class TorneoEquipoModule {}

