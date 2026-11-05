import { PartialType } from '@nestjs/swagger';
import { CreateJugadorDto } from './create-jugadore.dto.js';

export class UpdateJugadorDto extends PartialType(CreateJugadorDto) {}