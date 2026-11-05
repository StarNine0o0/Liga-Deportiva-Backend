import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  type Relation,
} from 'typeorm';
import { Equipo } from '../../equipos/entities/equipo.entity.js';
// import { Torneo } from '../../torneos/entities/torneo.entity.js';       // TODO: Descomentar cuando Dev2 agregue la entidad Torneo
// import { Temporada } from '../../temporadas/entities/temporada.entity.js'; // TODO: Descomentar cuando Dev2 agregue la entidad Temporada

@Entity('posiciones')
export class Posicion {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * FK hacia tabla `torneos` del Desarrollador 2.
   * ⚠️ RECORDATORIO: Cambiar el nombre de esta columna si tu compañero
   *    usa un nombre diferente para la PK de la tabla torneos.
   */
  @Column()
  torneoId: number;
  // TODO: Descomentar cuando Dev2 agregue la entidad Torneo
  // @ManyToOne(() => Torneo)
  // torneo: Relation<Torneo>;

  /**
   * FK hacia tabla `temporadas` del Desarrollador 2.
   * ⚠️ RECORDATORIO: Cambiar el nombre de esta columna si tu compañero
   *    usa un nombre diferente para la PK de la tabla temporadas.
   */
  @Column()
  temporadaId: number;
  // TODO: Descomentar cuando Dev2 agregue la entidad Temporada
  // @ManyToOne(() => Temporada)
  // temporada: Relation<Temporada>;

  @ManyToOne(() => Equipo)
  equipo: Relation<Equipo>;

  @Column()
  equipoId: number;

  /** Partidos jugados */
  @Column({ type: 'int', default: 0 })
  pj: number;

  /** Partidos ganados */
  @Column({ type: 'int', default: 0 })
  pg: number;

  /** Partidos empatados */
  @Column({ type: 'int', default: 0 })
  pe: number;

  /** Partidos perdidos */
  @Column({ type: 'int', default: 0 })
  pp: number;

  /** Goles a favor */
  @Column({ type: 'int', default: 0 })
  gf: number;

  /** Goles en contra */
  @Column({ type: 'int', default: 0 })
  gc: number;

  /** Puntos */
  @Column({ type: 'int', default: 0 })
  pts: number;
}

