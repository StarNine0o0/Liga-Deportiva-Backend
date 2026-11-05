import { PartialType } from '@nestjs/swagger';
import { CreateTorneoEquipoDto } from './create-torneo-equipo.dto.js';

export class UpdateTorneoEquipoDto extends PartialType(
  CreateTorneoEquipoDto,
) {}

