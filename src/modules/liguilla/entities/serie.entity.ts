import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Unique,
  type Relation,
} from 'typeorm';
import { Torneo } from '../../torneos/entities/torneo.entity.js';
import { Equipo } from '../../equipos/entities/equipo.entity.js';

export type RondaLiguilla = 'CUARTOS' | 'SEMIFINAL' | 'FINAL';
export type EstadoSerie = 'PENDIENTE' | 'EN_JUEGO' | 'FINALIZADA';

/** Un cruce de la liguilla (1 partido, o 2 si es ida y vuelta). */
@Entity('series')
@Unique(['torneoId', 'ronda', 'orden'])
export class Serie {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Torneo, { onDelete: 'CASCADE' })
  torneo: Relation<Torneo>;

  @Column()
  torneoId: number;

  @Column({ type: 'enum', enum: ['CUARTOS', 'SEMIFINAL', 'FINAL'] })
  ronda: RondaLiguilla;

  /** Posición dentro de la ronda (1, 2, 3...) */
  @Column({ type: 'int' })
  orden: number;

  @ManyToOne(() => Equipo, { nullable: true })
  equipoA: Relation<Equipo> | null;

  @Column({ type: 'int', nullable: true })
  equipoAId: number | null;

  /** Posición en la tabla general del equipo A (1 = primero) */
  @Column({ type: 'int', nullable: true })
  seedA: number | null;

  @ManyToOne(() => Equipo, { nullable: true })
  equipoB: Relation<Equipo> | null;

  @Column({ type: 'int', nullable: true })
  equipoBId: number | null;

  @Column({ type: 'int', nullable: true })
  seedB: number | null;

  @ManyToOne(() => Equipo, { nullable: true })
  ganador: Relation<Equipo> | null;

  @Column({ type: 'int', nullable: true })
  ganadorId: number | null;

  /** Serie "padre" a la que avanza el ganador (null en la final) */
  @ManyToOne(() => Serie, { nullable: true, onDelete: 'SET NULL' })
  siguienteSerie: Relation<Serie> | null;

  @Column({ type: 'int', nullable: true })
  siguienteSerieId: number | null;

  /** En qué lado de la serie padre entra el ganador */
  @Column({ type: 'varchar', length: 1, nullable: true })
  slotSiguiente: 'A' | 'B' | null;

  @Column({
    type: 'enum',
    enum: ['PENDIENTE', 'EN_JUEGO', 'FINALIZADA'],
    default: 'PENDIENTE',
  })
  estado: EstadoSerie;

  @CreateDateColumn()
  createdAt: Date;
}