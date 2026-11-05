import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAlineacionDto {
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

  @ApiPropertyOptional({ example: true, description: 'Si es titular' })
  @IsBoolean()
  @IsOptional()
  titular?: boolean;

  @ApiProperty({ example: 'Delantero' })
  @IsString()
  @MaxLength(50)
  posicion: string;

  @ApiPropertyOptional({ example: 90, description: 'Minutos jugados' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minutosJugados?: number;
}

