import { PartialType } from '@nestjs/swagger';
import { CreatePosicionDto } from './create-posicion.dto.js';

export class UpdatePosicionDto extends PartialType(CreatePosicionDto) {}

