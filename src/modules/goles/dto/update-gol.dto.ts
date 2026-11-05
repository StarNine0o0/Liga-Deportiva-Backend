import { PartialType } from '@nestjs/swagger';
import { CreateGolDto } from './create-gol.dto.js';

export class UpdateGolDto extends PartialType(CreateGolDto) {}

