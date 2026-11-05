import { PartialType } from '@nestjs/swagger';
import { CreatePartidoDto } from './create-partido.dto.js';

export class UpdatePartidoDto extends PartialType(CreatePartidoDto) {}