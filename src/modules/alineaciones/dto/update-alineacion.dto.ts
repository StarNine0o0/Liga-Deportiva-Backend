import { PartialType } from '@nestjs/swagger';
import { CreateAlineacionDto } from './create-alineacion.dto.js';

export class UpdateAlineacionDto extends PartialType(CreateAlineacionDto) {}

