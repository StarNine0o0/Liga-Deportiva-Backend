import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTorneoDto {
  @ApiProperty({ example: 'Copa Apertura' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @ApiPropertyOptional({ example: 'Torneo de la primera vuelta' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  descripcion?: string;

  @ApiProperty({ example: '2026-08-15' })
  @IsDateString()
  fechaInicio: string;

  @ApiProperty({ example: '2026-12-15' })
  @IsDateString()
  fechaFin: string;

  @ApiPropertyOptional({
    example: 'PROGRAMADO',
    enum: ['PROGRAMADO', 'EN_CURSO', 'FINALIZADO'],
  })
  @IsIn(['PROGRAMADO', 'EN_CURSO', 'FINALIZADO'])
  @IsOptional()
  estado?: 'PROGRAMADO' | 'EN_CURSO' | 'FINALIZADO';

  @ApiProperty({ example: 1, description: 'ID de la temporada' })
  @IsInt()
  temporadaId: number;
}