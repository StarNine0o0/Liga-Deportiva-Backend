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

@Entity('jornadas')
@Unique(['torneoId', 'numero'])
export class Jornada {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  numero: number;

  @Column({ type: 'date', nullable: true })
  fecha: string;

  @ManyToOne(() => Torneo)
  torneo: Relation<Torneo>;

  @Column()
  torneoId: number;

  @CreateDateColumn()
  createdAt: Date;
}