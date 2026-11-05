import { PartialType } from '@nestjs/swagger';
import { CreateEquipoDto } from './create-equipo.dto.js';

export class UpdateEquipoDto extends PartialType(CreateEquipoDto) {}

