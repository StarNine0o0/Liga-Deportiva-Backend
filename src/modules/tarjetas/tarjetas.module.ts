import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tarjeta } from './entities/tarjeta.entity.js';
import { TarjetasService } from './tarjetas.service.js';
import { TarjetasController } from './tarjetas.controller.js';
import { PartidosModule } from '../partidos/partidos.module.js';
import { JugadoresModule } from '../jugadores/jugadores.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tarjeta]),
    PartidosModule,
    JugadoresModule,
  ],
  controllers: [TarjetasController],
  providers: [TarjetasService],
  exports: [TarjetasService],
})
export class TarjetasModule {}