import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  type Relation,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity.js';
import { Sede } from '../../sedes/entities/sede.entity.js';

@Entity('equipos')
export class Equipo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  nombre: string;

  @Column({ type: 'varchar', length: 100 })
  entrenadorNombre: string;

  @ManyToOne(() => Usuario)
  capitan: Relation<Usuario>;

  @Column()
  capitanId: number;

  @Column({ nullable: true })
  sedeId: number;

  @ManyToOne(() => Sede, { nullable: true })
  sede: Relation<Sede>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logoUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}

