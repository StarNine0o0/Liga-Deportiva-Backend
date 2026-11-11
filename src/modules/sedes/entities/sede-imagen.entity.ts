import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  type Relation,
} from 'typeorm';
import { Sede } from './sede.entity.js';

@Entity('sede_imagenes')
export class SedeImagen {
  @PrimaryGeneratedColumn()
  id: number;

  /** Nombre del archivo físico dentro de uploads/sedes/ */
  @Column({ type: 'varchar', length: 255 })
  archivo: string;

  /** Orden en el carrusel (0, 1, 2, ...) */
  @Column({ type: 'int', default: 0 })
  orden: number;

  @ManyToOne(() => Sede, (sede) => sede.imagenes, { onDelete: 'CASCADE' })
  sede: Relation<Sede>;

  @Column()
  sedeId: number;

  @CreateDateColumn()
  createdAt: Date;
}