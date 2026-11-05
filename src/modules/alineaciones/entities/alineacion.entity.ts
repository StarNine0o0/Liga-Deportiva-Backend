import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  type Relation,
} from 'typeorm';
import { Equipo } from '../../equipos/entities/equipo.entity.js';
// import { Partido } from '../../partidos/entities/partido.entity.js'; // TODO: Descomentar cuando Dev2 agregue la entidad Partido
// import { Jugador } from '../../jugadores/entities/jugador.entity.js'; // TODO: Descomentar cuando Dev2 agregue la entidad Jugador

@Entity('alineaciones')
export class Alineacion {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * FK hacia tabla `partidos` del Desarrollador 2.
   * ⚠️ RECORDATORIO: Cambiar el nombre de esta columna si tu compañero
   *    usa un nombre diferente para la PK de la tabla partidos.
   */
  @Column()
  partidoId: number;
  // TODO: Descomentar cuando Dev2 agregue la entidad Partido
  // @ManyToOne(() => Partido)
  // partido: Relation<Partido>;

  /**
   * FK hacia tabla `jugadores` del Desarrollador 2.
   * ⚠️ RECORDATORIO: Cambiar el nombre de esta columna si tu compañero
   *    usa un nombre diferente para la PK de la tabla jugadores.
   */
  @Column()
  jugadorId: number;
  // TODO: Descomentar cuando Dev2 agregue la entidad Jugador
  // @ManyToOne(() => Jugador)
  // jugador: Relation<Jugador>;

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

