import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  type Relation,
} from 'typeorm';
import { Rol } from '../../roles/entities/rol.entity.js';
import { Equipo } from '../../equipos/entities/equipo.entity.js'; // AJUSTA la ruta

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @ManyToOne(() => Rol, { eager: true })
  rol: Relation<Rol>;

  @Column()
  rolId: number;

  // Solo para capitán / entrenador
  @ManyToOne(() => Equipo, { nullable: true, onDelete: 'SET NULL' })
  equipo: Relation<Equipo> | null;

  @Column({ type: 'int', nullable: true })
  equipoId: number | null;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}