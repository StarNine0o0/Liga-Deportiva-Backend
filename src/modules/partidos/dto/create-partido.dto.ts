import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePartidoDto {
  @ApiProperty({ example: 1, description: 'ID de la jornada' })
  @IsInt()
  jornadaId: number;

  @ApiProperty({ example: 1, description: 'ID del equipo local' })
  @IsInt()
  equipoLocalId: number;

  @ApiProperty({ example: 2, description: 'ID del equipo visitante' })
  @IsInt()
  equipoVisitanteId: number;

  @ApiPropertyOptional({ example: 1, description: 'ID de la sede' })
  @IsInt()
  @IsOptional()
  sedeId?: number;

  @ApiProperty({ example: '2026-08-22T18:00:00' })
  @IsDateString()
  fechaHora: string;

  @ApiPropertyOptional({ example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  golesLocal?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  golesVisitante?: number;

  @ApiPropertyOptional({
    example: 'PROGRAMADO',
    enum: ['PROGRAMADO', 'EN_JUEGO', 'FINALIZADO', 'SUSPENDIDO'],
  })
  @IsIn(['PROGRAMADO', 'EN_JUEGO', 'FINALIZADO', 'SUSPENDIDO'])
  @IsOptional()
  estado?: 'PROGRAMADO' | 'EN_JUEGO' | 'FINALIZADO' | 'SUSPENDIDO';
}