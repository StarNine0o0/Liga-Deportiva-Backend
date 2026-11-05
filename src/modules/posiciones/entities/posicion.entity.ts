import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  type Relation,
} from 'typeorm';
import { Equipo } from '../../equipos/entities/equipo.entity.js';
import { Torneo } from '../../torneos/entities/torneo.entity.js';
import { Temporada } from '../../temporadas/entities/temporada.entity.js';

@Entity('posiciones')
export class Posicion {
  @PrimaryGeneratedColumn()
  id: number;

    @ManyToOne(() => Torneo)
  torneo: Relation<Torneo>;

  @Column()
  torneoId: number;

  @ManyToOne(() => Temporada)
  temporada: Relation<Temporada>;

  @Column()
  temporadaId: number;
  
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

