import { IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePosicionDto {
  @ApiProperty({
    example: 1,
    description: 'ID del torneo (tabla del Dev2). ⚠️ Verificar nombre con compañero.',
  })
  @IsNumber()
  torneoId: number;

  @ApiProperty({
    example: 1,
    description: 'ID de la temporada (tabla del Dev2). ⚠️ Verificar nombre con compañero.',
  })
  @IsNumber()
  temporadaId: number;

  @ApiProperty({ example: 1, description: 'ID del equipo' })
  @IsNumber()
  equipoId: number;

  @ApiPropertyOptional({ example: 0, description: 'Partidos jugados' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  pj?: number;

  @ApiPropertyOptional({ example: 0, description: 'Partidos ganados' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  pg?: number;

  @ApiPropertyOptional({ example: 0, description: 'Partidos empatados' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  pe?: number;

  @ApiPropertyOptional({ example: 0, description: 'Partidos perdidos' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  pp?: number;

  @ApiPropertyOptional({ example: 0, description: 'Goles a favor' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  gf?: number;

  @ApiPropertyOptional({ example: 0, description: 'Goles en contra' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  gc?: number;

  @ApiPropertyOptional({ example: 0, description: 'Puntos' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  pts?: number;
}

