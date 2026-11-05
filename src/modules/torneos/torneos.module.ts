import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Torneo } from './entities/torneo.entity.js';
import { TorneosService } from './torneos.service.js';
import { TorneosController } from './torneos.controller.js';
import { TemporadasModule } from '../temporadas/temporadas.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Torneo]), TemporadasModule],
  controllers: [TorneosController],
  providers: [TorneosService],
  exports: [TorneosService],
})
export class TorneosModule {}