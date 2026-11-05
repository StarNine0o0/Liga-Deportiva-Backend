import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Rol } from '../../modules/roles/entities/rol.entity.js';
import { Usuario } from '../../modules/usuarios/entities/usuario.entity.js';

/**
 * Servicio de seeds que se ejecuta al iniciar la aplicación.
 * Inserta datos iniciales si no existen.
 */
@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
    await this.seedAdminUser();
  }

  /**
   * Inserta los roles predefinidos: admin, arbitro, capitan.
   */
  private async seedRoles() {
    const rolesDefault = ['admin', 'arbitro', 'capitan'];

    for (const nombre of rolesDefault) {
      const existe = await this.rolRepository.findOne({ where: { nombre } });
      if (!existe) {
        await this.rolRepository.save(
          this.rolRepository.create({ nombre }),
        );
        this.logger.log(`Rol "${nombre}" creado`);
      }
    }
  }

  /**
   * Crea un usuario administrador por defecto si no existe.
   * Credenciales: admin@liga.com / admin123
   */
  private async seedAdminUser() {
    const adminEmail = 'admin@liga.com';
    const existe = await this.usuarioRepository.findOne({
      where: { email: adminEmail },
    });

    if (!existe) {
      const rolAdmin = await this.rolRepository.findOne({
        where: { nombre: 'admin' },
      });

      if (rolAdmin) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await this.usuarioRepository.save(
          this.usuarioRepository.create({
            nombre: 'Administrador',
            email: adminEmail,
            password: hashedPassword,
            rolId: rolAdmin.id,
            activo: true,
          }),
        );
        this.logger.log(
          ` Usuario admin creado (email: ${adminEmail}, password: admin123)`,
        );
      }
    }
  }
}

