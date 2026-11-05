import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Unique,
  type Relation,
} from 'typeorm';
import { Equipo } from '../../equipos/entities/equipo.entity.js';

export type PosicionJugador =
  | 'PORTERO'
  | 'DEFENSA'
  | 'MEDIOCAMPISTA'
  | 'DELANTERO';

@Entity('jugadores')
@Unique(['equipoId', 'numeroCamiseta'])
export class Jugador {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 100 })
  apellidos: string;

  @Column({ type: 'int' })
  numeroCamiseta: number;

  @Column({
    type: 'enum',
    enum: ['PORTERO', 'DEFENSA', 'MEDIOCAMPISTA', 'DELANTERO'],
  })
  posicion: PosicionJugador;

  @Column({ type: 'date', nullable: true })
  fechaNacimiento: string;

  @ManyToOne(() => Equipo)
  equipo: Relation<Equipo>;

  @Column()
  equipoId: number;

  @CreateDateColumn()
  createdAt: Date;
}