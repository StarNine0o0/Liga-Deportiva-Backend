import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sede } from './entities/sede.entity.js';
import { SedeImagen } from './entities/sede-imagen.entity.js';
import { SedesService } from './sedes.service.js';
import { SedesController } from './sedes.controller.js';
import { UploadsModule } from '../../common/uploads/uploads.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sede, SedeImagen]),
    UploadsModule,
  ],
  controllers: [SedesController],
  providers: [SedesService],
  exports: [SedesService],
})
export class SedesModule {}