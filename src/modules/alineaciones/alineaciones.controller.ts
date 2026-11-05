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
import { AlineacionesService } from './alineaciones.service.js';
import { CreateAlineacionDto } from './dto/create-alineacion.dto.js';
import { UpdateAlineacionDto } from './dto/update-alineacion.dto.js';

@ApiTags('Alineaciones')
@ApiBearerAuth()
@Controller('alineaciones')
export class AlineacionesController {
  constructor(private readonly alineacionesService: AlineacionesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una alineación (cédula de juego)' })
  create(@Body() createAlineacionDto: CreateAlineacionDto) {
    return this.alineacionesService.create(createAlineacionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las alineaciones' })
  findAll() {
    return this.alineacionesService.findAll();
  }

  @Get('partido/:partidoId')
  @ApiOperation({ summary: 'Obtener alineaciones por partido' })
  findByPartido(@Param('partidoId', ParseIntPipe) partidoId: number) {
    return this.alineacionesService.findByPartido(partidoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una alineación por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.alineacionesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una alineación' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAlineacionDto: UpdateAlineacionDto,
  ) {
    return this.alineacionesService.update(id, updateAlineacionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una alineación' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.alineacionesService.remove(id);
  }
}

