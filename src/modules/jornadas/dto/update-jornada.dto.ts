import { PartialType } from '@nestjs/swagger';
import { CreateJornadaDto } from './create-jornada.dto.js';

export class UpdateJornadaDto extends PartialType(CreateJornadaDto) {}