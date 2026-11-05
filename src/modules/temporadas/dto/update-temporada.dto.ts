import { PartialType } from '@nestjs/swagger';
import { CreateTemporadaDto } from './create-temporada.dto.js';

export class UpdateTemporadaDto extends PartialType(CreateTemporadaDto) {}
