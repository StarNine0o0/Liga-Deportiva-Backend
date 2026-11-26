import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  type Relation,
} from 'typeorm';
import { Equipo } from '../../equipos/entities/equipo.entity.js';
import { Jugador } from '../../jugadores/entities/jugadores.entity.js';
import { Partido } from '../../partidos/entities/partido.entity.js';

@Entity('goles')
export class Gol {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' }) //modificado para funcionar con el microservico de partidos 
partidoId: number;

  @ManyToOne(() => Jugador)
  jugador: Relation<Jugador>;

  @Column()
  jugadorId: number;
  
  @ManyToOne(() => Equipo)
  equipo: Relation<Equipo>;

  @Column()
  equipoId: number;

  @Column({ type: 'int' })
  minuto: number;

  @Column({
    type: 'enum',
    enum: ['normal', 'penal', 'autogol'],
    default: 'normal',
  })
  tipo: string;
}

