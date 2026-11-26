import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  type Relation,
} from 'typeorm';
import { Partido } from '../../partidos/entities/partido.entity.js';
import { Jugador } from '../../jugadores/entities/jugadores.entity.js';

export type TipoTarjeta = 'AMARILLA' | 'ROJA';

@Entity('tarjetas')
export class Tarjeta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })//modificado para funcionar con el microservico de partidos 
  partidoId: number;

  @ManyToOne(() => Jugador)
  jugador: Relation<Jugador>;

  @Column()
  jugadorId: number;

  @Column({ type: 'enum', enum: ['AMARILLA', 'ROJA'] })
  tipo: TipoTarjeta;

  @Column({ type: 'int' })
  minuto: number;

  @CreateDateColumn()
  createdAt: Date;
}