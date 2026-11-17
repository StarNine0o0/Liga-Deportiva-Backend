import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Rol } from '../../modules/roles/entities/rol.entity.js';
import { Usuario } from '../../modules/usuarios/entities/usuario.entity.js';
import { Equipo } from '../../modules/equipos/entities/equipo.entity.js';

/**
 * Servicio de seeds que se ejecuta al iniciar la aplicación.
 * Inserta datos iniciales si no existen (se puede correr varias veces).
 */
@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Equipo)
    private readonly equipoRepository: Repository<Equipo>,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
    await this.seedAdminUser();
    await this.seedUsuariosDePrueba();
  }

  /**
   * Inserta los roles predefinidos: admin, arbitro, capitan, entrenador.
   * (El invitado no es un rol de BD: entra con POST /auth/invitado.)
   */
  private async seedRoles() {
    const rolesDefault = ['admin', 'arbitro', 'capitan', 'entrenador'];

    for (const nombre of rolesDefault) {
      const existe = await this.rolRepository.findOne({ where: { nombre } });
      if (!existe) {
        await this.rolRepository.save(this.rolRepository.create({ nombre }));
        this.logger.log(`Rol "${nombre}" creado`);
      }
    }
  }

  /**
   * Crea un usuario si su email no existe; si existe, lo devuelve tal cual.
   */
  private async crearUsuario(
    nombre: string,
    email: string,
    password: string,
    rolNombre: string,
  ): Promise<Usuario | null> {
    const existente = await this.usuarioRepository.findOne({ where: { email } });
    if (existente) return existente;

    const rol = await this.rolRepository.findOne({
      where: { nombre: rolNombre },
    });
    if (!rol) return null;

    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
    const usuario = await this.usuarioRepository.save(
      this.usuarioRepository.create({
        nombre,
        email,
        password: hashedPassword,
        rolId: rol.id,
        activo: true,
      }),
    );
    this.logger.log(`Usuario ${rolNombre} creado (${email} / ${password})`);
    return usuario;
  }

  /**
   * Administrador por defecto. Credenciales: admin@liga.com / admin123
   */
  private async seedAdminUser() {
    await this.crearUsuario(
      'Administrador',
      'admin@liga.com',
      'admin123',
      'admin',
    );
  }

  /**
   * Cuentas de prueba para probar cada rol (solo fuera de producción).
   * Orden: el capitán existe antes que el equipo (el equipo pide capitanId)
   * y luego se enlaza el equipoId del capitán y del entrenador.
   */
  private async seedUsuariosDePrueba() {
    if (process.env.NODE_ENV === 'production') return;

    await this.crearUsuario(
      'Árbitro de prueba',
      'arbitro@liga.com',
      'arbitro123',
      'arbitro',
    );
    const capitan = await this.crearUsuario(
      'Capitán de prueba',
      'capitan@liga.com',
      'capitan123',
      'capitan',
    );
    const entrenador = await this.crearUsuario(
      'Entrenador de prueba',
      'entrenador@liga.com',
      'entrenador123',
      'entrenador',
    );
    if (!capitan || !entrenador) return;

    let equipo = await this.equipoRepository.findOne({
      where: { nombre: 'Equipo Demo' },
    });
    if (!equipo) {
      equipo = await this.equipoRepository.save(
        this.equipoRepository.create({
          nombre: 'Equipo Demo',
          entrenadorNombre: entrenador.nombre,
          capitanId: capitan.id,
        }),
      );
      this.logger.log('Equipo "Equipo Demo" creado');
    }

    await this.usuarioRepository.update(
      { id: In([capitan.id, entrenador.id]) },
      { equipoId: equipo.id },
    );
  }
}