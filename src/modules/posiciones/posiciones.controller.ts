import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PosicionesService } from './posiciones.service.js';
import { CreatePosicionDto } from './dto/create-posicion.dto.js';
import { UpdatePosicionDto } from './dto/update-posicion.dto.js';

@ApiTags('Posiciones')
@ApiBearerAuth()
@Controller('posiciones')
export class PosicionesController {
  constructor(private readonly posicionesService: PosicionesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear registro de posición' })
  create(@Body() createPosicionDto: CreatePosicionDto) {
    return this.posicionesService.create(createPosicionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las posiciones' })
  findAll() {
    return this.posicionesService.findAll();
  }

  @Get('torneo/:torneoId')
  @ApiOperation({
    summary: 'Obtener tabla de posiciones por torneo (ordenada por puntos)',
  })
  findByTorneo(@Param('torneoId', ParseIntPipe) torneoId: number) {
    return this.posicionesService.findByTorneo(torneoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una posición por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.posicionesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar posición (PJ, PG, PE, PP, GF, GC, PTS)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePosicionDto: UpdatePosicionDto,
  ) {
    return this.posicionesService.update(id, updatePosicionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar registro de posición' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.posicionesService.remove(id);
  }
}

