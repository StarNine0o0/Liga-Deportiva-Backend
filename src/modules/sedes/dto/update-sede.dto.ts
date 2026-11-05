import { PartialType } from '@nestjs/swagger';
import { CreateSedeDto } from './create-sede.dto.js';

export class UpdateSedeDto extends PartialType(CreateSedeDto) {}
