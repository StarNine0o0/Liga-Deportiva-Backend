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

  @ManyToOne(() => Temporada)
  temporada: Relation<Temporada>;

  @Column()
  temporadaId: number;

  @CreateDateColumn()
  createdAt: Date;
}