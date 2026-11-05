import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRolDto {
  @ApiProperty({ example: 'admin', description: 'Nombre del rol' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nombre: string;
}

