import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  type Relation,
} from 'typeorm';
import { Equipo } from '../../equipos/entities/equipo.entity.js';
import { Partido } from '../../partidos/entities/partido.entity.js';
import { Jugador } from '../../jugadores/entities/jugadores.entity.js';

@Entity('alineaciones')
export class Alineacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })//modificado para funcionar con el microservico de partidos 
  partidoId: number;

  @ManyToOne(() => Jugador)
  jugador: Relation<Jugador>;

  @Column()
  jugadorId: number;
  
  @ManyToOne(() => Equipo)
  equipo: Relation<Equipo>;

  @Column()
  equipoId: number;

  @Column({ type: 'boolean', default: true })
  titular: boolean;

  @Column({ type: 'varchar', length: 50 })
  posicion: string;

  @Column({ type: 'int', default: 0 })
  minutosJugados: number;
}

