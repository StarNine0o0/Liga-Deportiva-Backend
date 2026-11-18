import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ConfigLiguillaDto {
  @ApiPropertyOptional({
    example: 8,
    enum: [0, 4, 8],
    description: '0 = sin liguilla, 4 = Top 4, 8 = Top 8',
  })
  @IsOptional()
  @IsIn([0, 4, 8])
  liguillaTamano?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'false = partido único, true = ida y vuelta',
  })
  @IsOptional()
  @IsBoolean()
  liguillaIdaVuelta?: boolean;

  @ApiPropertyOptional({
    example: 'PENALES',
    enum: ['PENALES', 'POSICION'],
    description: 'Cómo se define un global empatado',
  })
  @IsOptional()
  @IsIn(['PENALES', 'POSICION'])
  desempateGlobal?: 'PENALES' | 'POSICION';
}

export class GenerarLiguillaDto {
  @ApiPropertyOptional({
    example: '2026-12-05T18:00:00',
    description: 'Fecha del primer partido (por defecto, dentro de 7 días)',
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Generar aunque queden partidos de fase regular sin finalizar',
  })
  @IsOptional()
  @IsBoolean()
  forzar?: boolean;
}