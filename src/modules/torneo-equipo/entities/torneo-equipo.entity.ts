import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  type Relation,
} from 'typeorm';
import { Equipo } from '../../equipos/entities/equipo.entity.js';
import { Torneo } from '../../torneos/entities/torneo.entity.js';

@Entity('torneo_equipo')
export class TorneoEquipo {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * FK hacia tabla `torneos` del Desarrollador 2.
   * ⚠️ RECORDATORIO: Cambiar el nombre de esta columna si tu compañero
   *    usa un nombre diferente para la PK de la tabla torneos.
   */
  @Column()
  torneoId: number;
  
  @ManyToOne(() => Equipo)
  equipo: Relation<Equipo>;

  @Column()
  equipoId: number;

  @Column({
    type: 'enum',
    enum: ['inscrito', 'aprobado', 'rechazado'],
    default: 'inscrito',
  })
  estatus: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  monto: number;

  @Column({ type: 'boolean', default: false })
  pagado: boolean;

  @Column({ type: 'date', nullable: true })
  fechaPago: Date;

  @CreateDateColumn()
  createdAt: Date;
}

