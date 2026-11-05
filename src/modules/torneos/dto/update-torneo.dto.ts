import { PartialType } from '@nestjs/swagger';
import { CreateTorneoDto } from './create-torneo.dto.js';

export class UpdateTorneoDto extends PartialType(CreateTorneoDto) {}
