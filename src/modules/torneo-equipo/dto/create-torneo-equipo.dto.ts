import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTorneoEquipoDto {
  @ApiProperty({
    example: 1,
    description: 'ID del torneo (tabla del Dev2). ⚠️ Verificar nombre con compañero.',
  })
  @IsNumber()
  torneoId: number;

  @ApiProperty({ example: 1, description: 'ID del equipo' })
  @IsNumber()
  equipoId: number;

  @ApiPropertyOptional({
    example: 'inscrito',
    enum: ['inscrito', 'aprobado', 'rechazado'],
  })
  @IsEnum(['inscrito', 'aprobado', 'rechazado'])
  @IsOptional()
  estatus?: string;

  @ApiPropertyOptional({ example: 500.0 })
  @IsNumber()
  @IsOptional()
  monto?: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  pagado?: boolean;

  @ApiPropertyOptional({ example: '2026-01-15' })
  @IsDateString()
  @IsOptional()
  fechaPago?: string;
}

