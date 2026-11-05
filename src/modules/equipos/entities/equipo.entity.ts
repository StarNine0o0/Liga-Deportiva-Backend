import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  type Relation,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity.js';
// import { Sede } from '../../sedes/entities/sede.entity.js'; // TODO: Descomentar cuando Dev2 agregue la entidad Sede

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

  /**
   * FK hacia tabla `sedes` del Desarrollador 2.
   * ⚠️ RECORDATORIO: Cambiar el nombre de esta columna si tu compañero
   *    usa un nombre diferente para la PK de la tabla sedes.
   */
  @Column({ nullable: true })
  sedeId: number;
  // TODO: Descomentar cuando Dev2 agregue la entidad Sede
  // @ManyToOne(() => Sede)
  // sede: Sede;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logoUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}

