import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import type { EstadoPartido } from './entities/partido.entity.js';

export interface PartidoRemoto {
  id: number;
  jornadaId: number;
  equipoLocalId: number;
  equipoVisitanteId: number;
  sedeId: number | null;
  arbitroId: number | null;
  serieId: number | null;
  numeroPartido: number | null;
  penalesLocal: number | null;
  penalesVisitante: number | null;
  fechaHora: Date | string;
  golesLocal: number;
  golesVisitante: number;
  estado: EstadoPartido;
  createdAt: Date | string;
}

export interface DatosPartidoRemoto {
  jornadaId: number;
  equipoLocalId: number;
  equipoVisitanteId: number;
  sedeId?: number | null;
  arbitroId?: number | null;
  serieId?: number | null;
  numeroPartido?: number | null;
  penalesLocal?: number | null;
  penalesVisitante?: number | null;
  fechaHora: string | Date;
  golesLocal?: number;
  golesVisitante?: number;
  estado?: EstadoPartido;
}

export type CambiosPartidoRemoto = Partial<DatosPartidoRemoto>;

export interface FiltroPartidosRemoto {
  jornadaId?: number;
  jornadaIds?: number[];
  serieId?: number;
  arbitroId?: number;
  equipoId?: number;
}

@Injectable()
export class PartidosGatewayService implements OnModuleInit {
  constructor(
    @Inject('PARTIDOS_SERVICE')
    private readonly client: ClientProxy,
  ) {}

  async onModuleInit() {
    await this.client.connect();
  }

  create(data: DatosPartidoRemoto): Promise<PartidoRemoto> {
    return firstValueFrom(
      this.client.send<PartidoRemoto>('partidos.create', data).pipe(timeout(5000)),
    );
  }

  findAll(filtro: FiltroPartidosRemoto = {}): Promise<PartidoRemoto[]> {
    return firstValueFrom(
      this.client
        .send<PartidoRemoto[]>('partidos.findAll', filtro)
        .pipe(timeout(5000)),
    );
  }

  findOne(id: number): Promise<PartidoRemoto | null> {
    return firstValueFrom(
      this.client
        .send<PartidoRemoto | null>('partidos.findOne', id)
        .pipe(timeout(5000)),
    );
  }

  update(id: number, data: CambiosPartidoRemoto): Promise<PartidoRemoto | null> {
    return firstValueFrom(
      this.client
        .send<PartidoRemoto | null>('partidos.update', { id, data })
        .pipe(timeout(5000)),
    );
  }

  remove(id: number): Promise<{ deleted: boolean }> {
    return firstValueFrom(
      this.client
        .send<{ deleted: boolean }>('partidos.remove', id)
        .pipe(timeout(5000)),
    );
  }
}