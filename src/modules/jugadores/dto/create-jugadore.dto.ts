import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJugadorDto {
  @ApiProperty({ example: 'Luis' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: 'Hernández Ruiz' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellidos: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  @Max(99)
  numeroCamiseta: number;

  @ApiProperty({
    example: 'DELANTERO',
    enum: ['PORTERO', 'DEFENSA', 'MEDIOCAMPISTA', 'DELANTERO'],
  })
  @IsIn(['PORTERO', 'DEFENSA', 'MEDIOCAMPISTA', 'DELANTERO'])
  posicion: 'PORTERO' | 'DEFENSA' | 'MEDIOCAMPISTA' | 'DELANTERO';

  @ApiPropertyOptional({ example: '2004-03-15' })
  @IsDateString()
  @IsOptional()
  fechaNacimiento?: string;

  @ApiProperty({ example: 1, description: 'ID del equipo' })
  @IsInt()
  equipoId: number;
}