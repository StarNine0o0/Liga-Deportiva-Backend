import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Jornada } from './entities/jornada.entity.js';
import { JornadasService } from './jornadas.service.js';
import { JornadasController } from './jornadas.controller.js';
import { TorneosModule } from '../torneos/torneos.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Jornada]), TorneosModule],
  controllers: [JornadasController],
  providers: [JornadasService],
  exports: [JornadasService],
})
export class JornadasModule {}