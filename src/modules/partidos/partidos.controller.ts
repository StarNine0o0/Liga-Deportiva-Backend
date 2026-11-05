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
import { PartidosService } from './partidos.service.js';
import { CreatePartidoDto } from './dto/create-partido.dto.js';
import { UpdatePartidoDto } from './dto/update-partido.dto.js';

@ApiTags('Partidos')
@ApiBearerAuth()
@Controller('partidos')
export class PartidosController {
  constructor(private readonly partidosService: PartidosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un partido' })
  create(@Body() dto: CreatePartidoDto) {
    return this.partidosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los partidos' })
  findAll() {
    return this.partidosService.findAll();
  }

  @Get('jornada/:jornadaId')
  @ApiOperation({ summary: 'Obtener los partidos de una jornada' })
  findByJornada(@Param('jornadaId', ParseIntPipe) jornadaId: number) {
    return this.partidosService.findByJornada(jornadaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un partido por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.partidosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un partido' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePartidoDto,
  ) {
    return this.partidosService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un partido' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.partidosService.remove(id);
  }
}