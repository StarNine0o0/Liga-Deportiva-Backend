import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  type Relation,
} from 'typeorm';
import { Jornada } from '../../jornadas/entities/jornada.entity.js';
import { Equipo } from '../../equipos/entities/equipo.entity.js';
import { Sede } from '../../sedes/entities/sede.entity.js';
import { Usuario } from '../../usuarios/entities/usuario.entity.js';

export type EstadoPartido =
  | 'PROGRAMADO'
  | 'EN_JUEGO'
  | 'FINALIZADO'
  | 'SUSPENDIDO';

@Entity('partidos')
export class Partido {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Jornada)
  jornada: Relation<Jornada>;

  @Column()
  jornadaId: number;

  @ManyToOne(() => Equipo)
  equipoLocal: Relation<Equipo>;

  @Column()
  equipoLocalId: number;

  @ManyToOne(() => Equipo)
  equipoVisitante: Relation<Equipo>;

  @Column()
  equipoVisitanteId: number;

  @ManyToOne(() => Sede, { nullable: true })
  sede: Relation<Sede>;

  @Column({ nullable: true })
  sedeId: number;

  // Árbitro asignado (usuario con rol 'arbitro')
  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  arbitro: Relation<Usuario> | null;

  @Column({ type: 'int', nullable: true })
  arbitroId: number | null;

  @Column({ type: 'datetime' })
  fechaHora: Date;

  @Column({ type: 'int', default: 0 })
  golesLocal: number;

  @Column({ type: 'int', default: 0 })
  golesVisitante: number;

  @Column({
    type: 'enum',
    enum: ['PROGRAMADO', 'EN_JUEGO', 'FINALIZADO', 'SUSPENDIDO'],
    default: 'PROGRAMADO',
  })
  estado: EstadoPartido;

  @CreateDateColumn()
  createdAt: Date;
}