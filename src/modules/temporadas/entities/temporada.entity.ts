import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('temporadas')
export class Temporada {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  nombre: string;

  @Column({ type: 'date' })
  fechaInicio: string;

  @Column({ type: 'date' })
  fechaFin: string;

  @Column({ type: 'boolean', default: false })
  activa: boolean;

  @CreateDateColumn()
  createdAt: Date;
}