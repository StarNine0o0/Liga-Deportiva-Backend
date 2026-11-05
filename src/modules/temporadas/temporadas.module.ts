import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Temporada } from './entities/temporada.entity.js';
import { TemporadasService } from './temporadas.service.js';
import { TemporadasController } from './temporadas.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Temporada])],
  controllers: [TemporadasController],
  providers: [TemporadasService],
  exports: [TemporadasService],
})
export class TemporadasModule {}