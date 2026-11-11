import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  type Relation,
} from 'typeorm';
import { SedeImagen } from './sede-imagen.entity.js';

@Entity('sedes')
export class Sede {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  nombre: string;

  @Column({ type: 'varchar', length: 255 })
  direccion: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ciudad: string;

  @Column({ type: 'int', nullable: true })
  capacidad: number;

  @OneToMany(() => SedeImagen, (img) => img.sede, { cascade: true })
  imagenes: Relation<SedeImagen>[];

  @CreateDateColumn()
  createdAt: Date;
}