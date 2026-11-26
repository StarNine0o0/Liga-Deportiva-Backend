import { Module, forwardRef } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartidosController } from './partidos.controller.js';
import { PartidosService } from './partidos.service.js';
import { PartidosGatewayService } from './partidos.gateway.js';
import { Alineacion } from '../alineaciones/entities/alineacion.entity.js';
import { JornadasModule } from '../jornadas/jornadas.module.js';
import { EquiposModule } from '../equipos/equipos.module.js';
import { SedesModule } from '../sedes/sedes.module.js';
import { JugadoresModule } from '../jugadores/jugadores.module.js';
import { LiguillaModule } from '../liguilla/liguilla.module.js';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PARTIDOS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.PARTIDOS_MS_HOST || '127.0.0.1',
          port: Number(process.env.PARTIDOS_MS_PORT || 3001),
        },
      },
    ]),
    TypeOrmModule.forFeature([Alineacion]),
    JornadasModule,
    EquiposModule,
    SedesModule,
    JugadoresModule,
    forwardRef(() => LiguillaModule),
  ],
  controllers: [PartidosController],
  providers: [PartidosGatewayService, PartidosService],
  exports: [PartidosGatewayService, PartidosService],
})
export class PartidosModule {}