import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  type Relation,
} from 'typeorm';
import { Temporada } from '../../temporadas/entities/temporada.entity.js';

export type EstadoTorneo = 'PROGRAMADO' | 'EN_CURSO' | 'FINALIZADO';

@Entity('torneos')
export class Torneo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion: string;

  @Column({ type: 'date' })
  fechaInicio: string;

  @Column({ type: 'date' })
  fechaFin: string;

  @Column({
    type: 'enum',
    enum: ['PROGRAMADO', 'EN_CURSO', 'FINALIZADO'],
    default: 'PROGRAMADO',
  })
  estado: EstadoTorneo;

  /** Clasificados a la liguilla: 0 = sin liguilla, 4 = Top 4, 8 = Top 8 */
  @Column({ type: 'int', default: 0 })
  liguillaTamano: number;

  /** false = partido único, true = ida y vuelta */
  @Column({ type: 'boolean', default: false })
  liguillaIdaVuelta: boolean;

  /** Si el global queda empatado: penales o mejor posición en la tabla */
  @Column({
    type: 'enum',
    enum: ['PENALES', 'POSICION'],
    default: 'POSICION',
  })
  desempateGlobal: 'PENALES' | 'POSICION';

  @ManyToOne(() => Temporada)
  temporada: Relation<Temporada>;

  @Column()
  temporadaId: number;

  @CreateDateColumn()
  createdAt: Date;
}