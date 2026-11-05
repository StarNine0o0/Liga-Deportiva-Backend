import { IsEnum, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGolDto {
  @ApiProperty({
    example: 1,
    description: 'ID del partido (tabla del Dev2). ⚠️ Verificar nombre con compañero.',
  })
  @IsNumber()
  partidoId: number;

  @ApiProperty({
    example: 1,
    description: 'ID del jugador (tabla del Dev2). ⚠️ Verificar nombre con compañero.',
  })
  @IsNumber()
  jugadorId: number;

  @ApiProperty({ example: 1, description: 'ID del equipo' })
  @IsNumber()
  equipoId: number;

  @ApiProperty({ example: 45, description: 'Minuto del gol' })
  @IsNumber()
  @Min(1)
  @Max(120)
  minuto: number;

  @ApiPropertyOptional({
    example: 'normal',
    enum: ['normal', 'penal', 'autogol'],
  })
  @IsEnum(['normal', 'penal', 'autogol'])
  @IsOptional()
  tipo?: string;
}

