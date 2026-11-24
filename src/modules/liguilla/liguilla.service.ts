import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Serie, type RondaLiguilla } from './entities/serie.entity.js';
import { Partido } from '../partidos/entities/partido.entity.js';
import { Jornada } from '../jornadas/entities/jornada.entity.js';
import { Torneo } from '../torneos/entities/torneo.entity.js';
import { TorneoEquipo } from '../torneo-equipo/entities/torneo-equipo.entity.js';
import { Equipo } from '../equipos/entities/equipo.entity.js';
import { EventEmitter } from 'node:events'; //para el long polling de la liguilla
import { createHash } from 'node:crypto';
import {
  ConfigLiguillaDto,
  GenerarLiguillaDto,
} from './dto/liguilla.dto.js';
import { version } from 'node:os';

export interface FilaTabla {
  posicion: number;
  equipoId: number;
  nombre: string;
  logoUrl: string | null;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dif: number;
  pts: number;
}

@Injectable()
export class LiguillaService {

  private readonly bracketEvents = new EventEmitter();  
  constructor(
    @InjectRepository(Serie)
    private readonly serieRepo: Repository<Serie>,
    @InjectRepository(Partido)
    private readonly partidoRepo: Repository<Partido>,
    @InjectRepository(Jornada)
    private readonly jornadaRepo: Repository<Jornada>,
    @InjectRepository(Torneo)
    private readonly torneoRepo: Repository<Torneo>,
    @InjectRepository(TorneoEquipo)
    private readonly torneoEquipoRepo: Repository<TorneoEquipo>,
    @InjectRepository(Equipo)
    private readonly equipoRepo: Repository<Equipo>,
  ) {
    this.bracketEvents.setMaxListeners(100); //evitar la advertencia de max listeners , para si hay muchos usuarios esperando el bracket
  }
  notificarCambioBracket(torneoId: number) { //Esto se usa para notificar a los clientes que el bracket ha cambiado 
    this.bracketEvents.emit(`bracketUpdate:${torneoId}`);
  }

  // ───────────────────────── utilidades ─────────────────────────

  private async getTorneo(id: number): Promise<Torneo> {
    const torneo = await this.torneoRepo.findOne({ where: { id } });
    if (!torneo) {
      throw new NotFoundException(`Torneo con ID ${id} no encontrado`);
    }
    return torneo;
  }

  private sumarDias(fecha: Date, dias: number): Date {
    const nueva = new Date(fecha);
    nueva.setDate(nueva.getDate() + dias);
    return nueva;
  }

  // ───────────────────── tabla general (fase regular) ─────────────────────

  /**
   * Puntos (3/1/0), luego diferencia de goles, luego goles a favor.
   * Solo cuentan los partidos FINALIZADOS de fase regular (sin serie).
   */
  async tabla(torneoId: number): Promise<FilaTabla[]> {
    await this.getTorneo(torneoId);

    const filas = new Map<number, FilaTabla>();
    const nueva = (e: Equipo): FilaTabla => ({
      posicion: 0,
      equipoId: e.id,
      nombre: e.nombre,
      logoUrl: e.logoUrl ?? null,
      pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dif: 0, pts: 0,
    });

    const inscritos = await this.torneoEquipoRepo.find({
      where: { torneoId, estatus: Not('rechazado') },
      relations: { equipo: true },
    });
    for (const i of inscritos) filas.set(i.equipoId, nueva(i.equipo));

    const partidos = await this.partidoRepo
      .createQueryBuilder('p')
      .innerJoin('p.jornada', 'j')
      .leftJoinAndSelect('p.equipoLocal', 'el')
      .leftJoinAndSelect('p.equipoVisitante', 'ev')
      .where('j.torneoId = :torneoId', { torneoId })
      .andWhere('p.serieId IS NULL')
      .andWhere('p.estado = :estado', { estado: 'FINALIZADO' })
      .getMany();

    for (const p of partidos) {
      if (!filas.has(p.equipoLocalId)) {
        filas.set(p.equipoLocalId, nueva(p.equipoLocal));
      }
      if (!filas.has(p.equipoVisitanteId)) {
        filas.set(p.equipoVisitanteId, nueva(p.equipoVisitante));
      }
      const l = filas.get(p.equipoLocalId)!;
      const v = filas.get(p.equipoVisitanteId)!;

      l.pj++; v.pj++;
      l.gf += p.golesLocal; l.gc += p.golesVisitante;
      v.gf += p.golesVisitante; v.gc += p.golesLocal;

      if (p.golesLocal > p.golesVisitante) {
        l.pg++; l.pts += 3; v.pp++;
      } else if (p.golesLocal < p.golesVisitante) {
        v.pg++; v.pts += 3; l.pp++;
      } else {
        l.pe++; v.pe++; l.pts += 1; v.pts += 1;
      }
    }

    const lista = [...filas.values()];
    for (const f of lista) f.dif = f.gf - f.gc;

    lista.sort(
      (a, b) =>
        b.pts - a.pts ||
        b.dif - a.dif ||
        b.gf - a.gf ||
        a.equipoId - b.equipoId,
    );
    lista.forEach((f, i) => (f.posicion = i + 1));
    return lista;
  }

  // ───────────────────────── configuración ─────────────────────────

  async configurar(torneoId: number, dto: ConfigLiguillaDto) {
    const torneo = await this.getTorneo(torneoId);

    const yaGenerada = await this.serieRepo.count({ where: { torneoId } });
    if (yaGenerada > 0) {
      throw new ConflictException(
        'La liguilla ya fue generada; reiníciala para cambiar la configuración',
      );
    }

    const tamano = dto.liguillaTamano ?? torneo.liguillaTamano;
    if (tamano > 0) {
      const inscritos = await this.torneoEquipoRepo.count({
        where: { torneoId, estatus: Not('rechazado') },
      });
      if (inscritos <= tamano) {
        throw new BadRequestException(
          `El torneo tiene ${inscritos} equipo(s) inscrito(s) y la liguilla es Top ${tamano}: se necesitan más equipos que clasificados`,
        );
      }
    }

    await this.torneoRepo.update(torneoId, {
      liguillaTamano: tamano,
      ...(dto.liguillaIdaVuelta !== undefined
        ? { liguillaIdaVuelta: dto.liguillaIdaVuelta }
        : {}),
      ...(dto.desempateGlobal ? { desempateGlobal: dto.desempateGlobal } : {}),
    });

    const t = await this.getTorneo(torneoId);
    return {
      liguillaTamano: t.liguillaTamano,
      liguillaIdaVuelta: t.liguillaIdaVuelta,
      desempateGlobal: t.desempateGlobal,
    };
  }

  // ───────────────────────── generar liguilla ─────────────────────────

  async generar(torneoId: number, dto: GenerarLiguillaDto) {
    const torneo = await this.getTorneo(torneoId);
    const tamano = torneo.liguillaTamano;

    if (tamano !== 4 && tamano !== 8) {
      throw new BadRequestException(
        'Configura primero el tamaño de la liguilla (Top 4 o Top 8)',
      );
    }
    if ((await this.serieRepo.count({ where: { torneoId } })) > 0) {
      throw new ConflictException(
        'La liguilla de este torneo ya fue generada',
      );
    }

    const tabla = await this.tabla(torneoId);
    if (tabla.length <= tamano) {
      throw new BadRequestException(
        `Hay ${tabla.length} equipo(s) y la liguilla es Top ${tamano}: se necesitan más equipos que clasificados`,
      );
    }

    if (!dto?.forzar) {
      const pendientes = await this.partidoRepo
        .createQueryBuilder('p')
        .innerJoin('p.jornada', 'j')
        .where('j.torneoId = :torneoId', { torneoId })
        .andWhere('p.serieId IS NULL')
        .andWhere('p.estado IN (:...estados)', {
          estados: ['PROGRAMADO', 'EN_JUEGO'],
        })
        .getCount();
      if (pendientes > 0) {
        throw new BadRequestException(
          `Quedan ${pendientes} partido(s) de fase regular sin finalizar (usa forzar: true para generar de todos modos)`,
        );
      }
      if (tabla.every((f) => f.pj === 0)) {
        throw new BadRequestException(
          'No hay partidos finalizados en la fase regular (usa forzar: true para probar)',
        );
      }
    }

    // 1) Árbol de series, de la final hacia atrás
    const crear = (
      ronda: RondaLiguilla,
      orden: number,
      siguiente?: Serie,
    ) =>
      this.serieRepo.save(
        this.serieRepo.create({
          torneoId,
          ronda,
          orden,
          estado: 'PENDIENTE',
          siguienteSerieId: siguiente?.id ?? null,
          slotSiguiente: siguiente ? (orden % 2 === 1 ? 'A' : 'B') : null,
        }),
      );

    const final = await crear('FINAL', 1);
    const semis = [
      await crear('SEMIFINAL', 1, final),
      await crear('SEMIFINAL', 2, final),
    ];

    let primeraRonda: Serie[] = semis;
    if (tamano === 8) {
      primeraRonda = [];
      for (let o = 1; o <= 4; o++) {
        primeraRonda.push(
          await crear('CUARTOS', o, semis[Math.ceil(o / 2) - 1]),
        );
      }
    }

    // 2) Seeding: Top 8 -> 1v8, 4v5 | 2v7, 3v6 ; Top 4 -> 1v4 | 2v3
    const cruces =
      tamano === 8
        ? [[1, 8], [4, 5], [2, 7], [3, 6]]
        : [[1, 4], [2, 3]];

    const base = dto?.fechaInicio
      ? new Date(dto.fechaInicio)
      : this.sumarDias(new Date(), 7);

    for (let i = 0; i < primeraRonda.length; i++) {
      const [s1, s2] = cruces[i];
      const a = tabla[s1 - 1];
      const b = tabla[s2 - 1];
      const serie = primeraRonda[i];

      const datos = {
        equipoAId: a.equipoId,
        seedA: s1,
        equipoBId: b.equipoId,
        seedB: s2,
      };
      await this.serieRepo.update(serie.id, datos);
      Object.assign(serie, datos);

      await this.crearPartidos(serie, torneo, base);
    }

    return this.bracket(torneoId);
    
    
  }

  /**
   * Long Polling: espera hasta `timeoutMs` a que cambie el bracket del torneo.
   * Devuelve el nuevo bracket si hubo cambio, o `null` si venció el tiempo (204).
   */
  async esperarCambioBracket(
    torneoId: number,
    versionCliente?: string,
    timeoutMs = 25_000,
    abortSignal?: AbortSignal,
  ) {
    const actual = await this.bracket(torneoId);

    // Si el cliente no mandó versión o el bracket ya cambió antes de entrar en espera, responder al instante
    if (!versionCliente || actual.version !== versionCliente) {
      return actual;
    }

    return new Promise<Awaited<ReturnType<LiguillaService['bracket']>> | null>(
      (resolve) => {
        const evento = `bracket:${torneoId}`;
        let terminado = false;

        const limpiar = () => {
          if (terminado) return;
          terminado = true;
          clearTimeout(timer);
          this.bracketEvents.off(evento, onCambio);
          abortSignal?.removeEventListener('abort', onAbort);
        };

        const onCambio = async () => {
          limpiar();
          try {
            const actualizado = await this.bracket(torneoId);
            resolve(actualizado);
          } catch {
            resolve(null);
          }
        };

        const onAbort = () => {
          limpiar();
          resolve(null);
        };

        const timer = setTimeout(() => {
          limpiar();
          resolve(null);
        }, timeoutMs);

        this.bracketEvents.on(evento, onCambio);
        abortSignal?.addEventListener('abort', onAbort, { once: true });
      },
    );
  }  

  /**
   * Crea los partidos de una serie cuando ya se conocen sus dos equipos.
   * Partido único: el mejor sembrado es local.
   * Ida y vuelta: el mejor sembrado cierra de local.
   */
  private async crearPartidos(
    serie: Serie,
    torneo: Torneo,
    fechaBase: Date,
  ) {
    const aEsMejor = (serie.seedA ?? 99) < (serie.seedB ?? 99);
    const mejorId = (aEsMejor ? serie.equipoAId : serie.equipoBId)!;
    const peorId = (aEsMejor ? serie.equipoBId : serie.equipoAId)!;

    const juegos = torneo.liguillaIdaVuelta
      ? [
          { numero: 1, local: peorId, visitante: mejorId, fecha: fechaBase },
          {
            numero: 2,
            local: mejorId,
            visitante: peorId,
            fecha: this.sumarDias(fechaBase, 3),
          },
        ]
      : [{ numero: 1, local: mejorId, visitante: peorId, fecha: fechaBase }];

    for (const j of juegos) {
      const jornadaId = await this.jornadaDeRonda(
        torneo.id,
        serie.ronda,
        j.numero,
        j.fecha,
      );
      await this.partidoRepo.save(
        this.partidoRepo.create({
          jornadaId,
          equipoLocalId: j.local,
          equipoVisitanteId: j.visitante,
          fechaHora: j.fecha,
          serieId: serie.id,
          numeroPartido: j.numero,
          estado: 'PROGRAMADO',
        }),
      );
    }

    await this.serieRepo.update(serie.id, { estado: 'EN_JUEGO' });
  }

  /** Una jornada por ronda y vuelta (todas las series de la ronda la comparten) */
  private async jornadaDeRonda(
    torneoId: number,
    ronda: RondaLiguilla,
    numeroPartido: number,
    fecha: Date,
  ): Promise<number> {
    const hermano = await this.partidoRepo
      .createQueryBuilder('p')
      .innerJoin('p.serie', 's')
      .where('s.torneoId = :torneoId', { torneoId })
      .andWhere('s.ronda = :ronda', { ronda })
      .andWhere('p.numeroPartido = :numeroPartido', { numeroPartido })
      .getOne();
    if (hermano) return hermano.jornadaId;

    const raw = await this.jornadaRepo
      .createQueryBuilder('j')
      .select('MAX(j.numero)', 'max')
      .where('j.torneoId = :torneoId', { torneoId })
      .getRawOne();
    const numero = Number(raw?.max ?? 0) + 1;

    const jornada = await this.jornadaRepo.save(
      this.jornadaRepo.create({
        torneoId,
        numero,
        fecha: fecha.toISOString().split('T')[0],
      }),
    );
    return jornada.id;
  }

  // ───────────────────────── avance automático ─────────────────────────

  /**
   * Se llama cada vez que se actualiza un partido.
   * Devuelve un aviso (texto) si la serie quedó esperando algo, o null.
   */
  async procesarPartido(partido: Partido): Promise<string | null> {
    if (!partido.serieId || partido.estado !== 'FINALIZADO') return null;
    return this.resolverSerie(partido.serieId);
  }

  private async resolverSerie(serieId: number): Promise<string | null> {
    const serie = await this.serieRepo.findOne({
      where: { id: serieId },
      relations: { torneo: true },
    });
    if (
      !serie ||
      serie.estado === 'FINALIZADA' ||
      !serie.equipoAId ||
      !serie.equipoBId
    ) {
      return null;
    }
    const torneo = serie.torneo;

    const partidos = await this.partidoRepo.find({
      where: { serieId },
      order: { numeroPartido: 'ASC' },
    });
    const requeridos = torneo.liguillaIdaVuelta ? 2 : 1;
    if (
      partidos.length < requeridos ||
      partidos.some((p) => p.estado !== 'FINALIZADO')
    ) {
      return null; // falta jugar la vuelta
    }

    // Marcador global
    let a = 0;
    let b = 0;
    for (const p of partidos) {
      if (p.equipoLocalId === serie.equipoAId) {
        a += p.golesLocal;
        b += p.golesVisitante;
      } else {
        b += p.golesLocal;
        a += p.golesVisitante;
      }
    }

    let ganadorA: boolean;
    if (a !== b) {
      ganadorA = a > b;
    } else if (torneo.desempateGlobal === 'POSICION') {
      ganadorA = (serie.seedA ?? 99) < (serie.seedB ?? 99);
    } else {
      const ultimo = partidos[partidos.length - 1];
      const pl = ultimo.penalesLocal;
      const pv = ultimo.penalesVisitante;
      if (pl === null || pv === null || pl === pv) {
        return 'Empate global: registra los penales (penalesLocal y penalesVisitante, sin empate) en el último partido de la serie para definir quién avanza.';
      }
      const ganaLocal = pl > pv;
      ganadorA = ganaLocal
        ? ultimo.equipoLocalId === serie.equipoAId
        : ultimo.equipoVisitanteId === serie.equipoAId;
    }

    const ganadorId = ganadorA ? serie.equipoAId : serie.equipoBId;
    const seedGanador = ganadorA ? serie.seedA : serie.seedB;

    await this.serieRepo.update(serie.id, { ganadorId, estado: 'FINALIZADA' });

    if (serie.siguienteSerieId) {
      await this.avanzar(
        serie.siguienteSerieId,
        serie.slotSiguiente,
        ganadorId,
        seedGanador,
        partidos[partidos.length - 1].fechaHora,
      );
    } else {
      // Ganó la final: torneo terminado
      await this.torneoRepo.update(torneo.id, { estado: 'FINALIZADO' });
    }
    return null;
  }

  private async avanzar(
    siguienteId: number,
    slot: 'A' | 'B' | null,
    ganadorId: number,
    seed: number | null,
    ultimaFecha: Date,
  ) {
    const siguiente = await this.serieRepo.findOne({
      where: { id: siguienteId },
      relations: { torneo: true },
    });
    if (!siguiente) return;

    const cambios =
      slot === 'A'
        ? { equipoAId: ganadorId, seedA: seed }
        : { equipoBId: ganadorId, seedB: seed };
    await this.serieRepo.update(siguiente.id, cambios);
    Object.assign(siguiente, cambios);

    // Cuando ya llegaron los dos equipos, se crean sus partidos
    if (siguiente.equipoAId && siguiente.equipoBId) {
      const ahora = new Date();
      const desde = ultimaFecha > ahora ? new Date(ultimaFecha) : ahora;
      await this.crearPartidos(
        siguiente,
        siguiente.torneo,
        this.sumarDias(desde, 7),
      );
    }
  }

  // ───────────────────────── bracket (lectura) ─────────────────────────

  async bracket(torneoId: number) {
    const torneo = await this.getTorneo(torneoId);

    const series = await this.serieRepo.find({
      where: { torneoId },
      relations: { equipoA: true, equipoB: true, ganador: true },
      order: { orden: 'ASC' },
    });

    const partidos = series.length
      ? await this.partidoRepo.find({
          where: { serieId: In(series.map((s) => s.id)) },
          relations: { equipoLocal: true, equipoVisitante: true },
          order: { numeroPartido: 'ASC' },
        })
      : [];

    const eq = (e: Equipo | null | undefined, seed: number | null = null) =>
      e
        ? { id: e.id, nombre: e.nombre, logoUrl: e.logoUrl ?? null, seed }
        : null;

    const orden: RondaLiguilla[] = ['CUARTOS', 'SEMIFINAL', 'FINAL'];
    const rondas = orden
      .map((ronda) => ({
        ronda,
        series: series
          .filter((s) => s.ronda === ronda)
          .map((s) => {
            const juegos = partidos.filter((p) => p.serieId === s.id);
            const jugados = juegos.filter((p) => p.estado === 'FINALIZADO');

            let global: { a: number; b: number } | null = null;
            if (jugados.length > 0 && s.equipoAId && s.equipoBId) {
              global = { a: 0, b: 0 };
              for (const p of jugados) {
                if (p.equipoLocalId === s.equipoAId) {
                  global.a += p.golesLocal;
                  global.b += p.golesVisitante;
                } else {
                  global.b += p.golesLocal;
                  global.a += p.golesVisitante;
                }
              }
            }

            return {
              id: s.id,
              orden: s.orden,
              estado: s.estado,
              equipoA: eq(s.equipoA, s.seedA),
              equipoB: eq(s.equipoB, s.seedB),
              ganadorId: s.ganadorId,
              global,
              siguienteSerieId: s.siguienteSerieId,
              slotSiguiente: s.slotSiguiente,
              partidos: juegos.map((p) => ({
                id: p.id,
                numero: p.numeroPartido,
                fechaHora: p.fechaHora,
                estado: p.estado,
                local: eq(p.equipoLocal),
                visitante: eq(p.equipoVisitante),
                golesLocal: p.golesLocal,
                golesVisitante: p.golesVisitante,
                penalesLocal: p.penalesLocal,
                penalesVisitante: p.penalesVisitante,
              })),
            };
          }),
      }))
      .filter((r) => r.series.length > 0);

    const final = series.find((s) => s.ronda === 'FINAL');
    const campeon = final?.ganador
      ? eq(
          final.ganador,
          final.ganadorId === final.equipoAId ? final.seedA : final.seedB,
        )
      : null;

    const payloadSinVersion = {
      torneoId,
      config: {
        liguillaTamano: torneo.liguillaTamano,
        liguillaIdaVuelta: torneo.liguillaIdaVuelta,
        desempateGlobal: torneo.desempateGlobal,
      },
      estado:
        series.length === 0
          ? ('SIN_GENERAR' as const)
          : campeon
            ? ('FINALIZADA' as const)
            : ('EN_CURSO' as const),
      campeon,
      rondas,
    };

    const version = createHash('sha1')
      .update(JSON.stringify(payloadSinVersion))
      .digest('hex')
      .slice(0, 12);

    return {
      ...payloadSinVersion,
      version,
    };
    
  }

  // ───────────────────────── reiniciar ─────────────────────────

  /** Borra la liguilla (solo si ningún partido de ella ha empezado) */
  async reiniciar(torneoId: number) {
    await this.getTorneo(torneoId);

    const series = await this.serieRepo.find({ where: { torneoId } });
    if (series.length === 0) return { reiniciada: false };

    const partidos = await this.partidoRepo.find({
      where: { serieId: In(series.map((s) => s.id)) },
    });
    if (partidos.some((p) => p.estado !== 'PROGRAMADO')) {
      throw new BadRequestException(
        'Hay partidos de la liguilla ya iniciados o finalizados: no se puede reiniciar',
      );
    }

    const jornadaIds = [...new Set(partidos.map((p) => p.jornadaId))];
    if (partidos.length) {
      await this.partidoRepo.delete({ id: In(partidos.map((p) => p.id)) });
    }
    await this.serieRepo.delete({ torneoId });
    if (jornadaIds.length) {
      await this.jornadaRepo.delete({ id: In(jornadaIds) });
    }
    return { reiniciada: true };
  }
}