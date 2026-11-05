import { IsIn, IsInt, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTarjetaDto {
  @ApiProperty({ example: 1, description: 'ID del partido' })
  @IsInt()
  partidoId: number;

  @ApiProperty({ example: 1, description: 'ID del jugador' })
  @IsInt()
  jugadorId: number;

  @ApiProperty({ example: 'AMARILLA', enum: ['AMARILLA', 'ROJA'] })
  @IsIn(['AMARILLA', 'ROJA'])
  tipo: 'AMARILLA' | 'ROJA';

  @ApiProperty({ example: 35, description: 'Minuto del partido' })
  @IsInt()
  @Min(0)
  @Max(130)
  minuto: number;
}