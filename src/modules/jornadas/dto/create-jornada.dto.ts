import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJornadaDto {
  @ApiProperty({ example: 1, description: 'Número de jornada' })
  @IsInt()
  @Min(1)
  numero: number;

  @ApiPropertyOptional({ example: '2026-08-22' })
  @IsDateString()
  @IsOptional()
  fecha?: string;

  @ApiProperty({ example: 1, description: 'ID del torneo' })
  @IsInt()
  torneoId: number;
}