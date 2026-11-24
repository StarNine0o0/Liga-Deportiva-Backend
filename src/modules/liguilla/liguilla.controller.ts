import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
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

  @Get(':torneoId/bracket/poll')
  @ApiOperation({ summary: 'Long Polling para actualizaciones en tiempo real del bracket' })
  @ApiQuery({ name: 'version', required: false, description: 'Hash de versión actual en cliente' })
  async pollBracket(
    @Param('torneoId', ParseIntPipe) torneoId: number,
    @Query('version') version: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const controller = new AbortController();
    res.on('close', () => {
      if (!res.writableEnded) {
        controller.abort();
      }
    });

    const resultado = await this.liguillaService.esperarCambioBracket(
      torneoId,
      version,
      25_000,
      controller.signal,
    );

    if (res.writableEnded) return;

    if (!resultado) {
      return res.status(HttpStatus.NO_CONTENT).send();
    }

    return res.status(HttpStatus.OK).json(resultado);
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