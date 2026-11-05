import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTemporadaDto {
  @ApiProperty({ example: 'Temporada 2026-2027' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: '2026-08-01' })
  @IsDateString()
  fechaInicio: string;

  @ApiProperty({ example: '2027-05-31' })
  @IsDateString()
  fechaFin: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  activa?: boolean;
}