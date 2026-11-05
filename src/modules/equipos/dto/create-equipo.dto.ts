import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEquipoDto {
  @ApiProperty({ example: 'Tigres FC' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: 'Carlos López' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  entrenadorNombre: string;

  @ApiProperty({ example: 1, description: 'ID del usuario capitán' })
  @IsNumber()
  capitanId: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID de la sede (tabla del Dev2)',
  })
  @IsNumber()
  @IsOptional()
  sedeId?: number;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  logoUrl?: string;
}

