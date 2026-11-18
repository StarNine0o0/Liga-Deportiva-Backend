import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LiguillaService } from './liguilla.service.js';
import {
  ConfigLiguillaDto,
  GenerarLiguillaDto,
} from './dto/liguilla.dto.js';
import { AdminEscribe } from '../auth/decorators/roles.decorator.js';

@ApiTags('Liguilla')
@ApiBearerAuth()
@AdminEscribe()
@Controller('liguilla')
export class LiguillaController {
  constructor(private readonly liguillaService: LiguillaService) {}

  @Get(':torneoId/tabla')
  @ApiOperation({ summary: 'Tabla general de la fase regular de un torneo' })
  tabla(@Param('torneoId', ParseIntPipe) torneoId: number) {
    return this.liguillaService.tabla(torneoId);
  }

  @Get(':torneoId/bracket')
  @ApiOperation({ summary: 'Bracket de la liguilla (series, partidos y campeón)' })
  bracket(@Param('torneoId', ParseIntPipe) torneoId: number) {
    return this.liguillaService.bracket(torneoId);
  }

  @Patch(':torneoId/config')
  @ApiOperation({ summary: 'Configurar la liguilla (Top 4/8, ida y vuelta, desempate)' })
  configurar(
    @Param('torneoId', ParseIntPipe) torneoId: number,
    @Body() dto: ConfigLiguillaDto,
  ) {
    return this.liguillaService.configurar(torneoId, dto);
  }

  @Post(':torneoId/generar')
  @ApiOperation({ summary: 'Generar la liguilla con los mejores de la tabla' })
  generar(
    @Param('torneoId', ParseIntPipe) torneoId: number,
    @Body() dto: GenerarLiguillaDto,
  ) {
    return this.liguillaService.generar(torneoId, dto);
  }

  @Delete(':torneoId')
  @ApiOperation({ summary: 'Reiniciar la liguilla (si no ha empezado ningún partido)' })
  reiniciar(@Param('torneoId', ParseIntPipe) torneoId: number) {
    return this.liguillaService.reiniciar(torneoId);
  }
}