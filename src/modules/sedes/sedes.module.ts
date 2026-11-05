import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sede } from './entities/sede.entity.js';
import { SedesService } from './sedes.service.js';
import { SedesController } from './sedes.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Sede])],
  controllers: [SedesController],
  providers: [SedesService],
  exports: [SedesService],
})
export class SedesModule {}
