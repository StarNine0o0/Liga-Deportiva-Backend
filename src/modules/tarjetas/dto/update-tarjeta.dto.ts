import { PartialType } from '@nestjs/swagger';
import { CreateTarjetaDto } from './create-tarjeta.dto.js';

export class UpdateTarjetaDto extends PartialType(CreateTarjetaDto) {}