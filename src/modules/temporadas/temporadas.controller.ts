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
import { TemporadasService } from './temporadas.service.js';
import { CreateTemporadaDto } from './dto/create-temporada.dto.js';
import { UpdateTemporadaDto } from './dto/update-temporada.dto.js';

@ApiTags('Temporadas')
@ApiBearerAuth()
@Controller('temporadas')
export class TemporadasController {
  constructor(private readonly temporadasService: TemporadasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva temporada' })
  create(@Body() dto: CreateTemporadaDto) {
    return this.temporadasService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las temporadas' })
  findAll() {
    return this.temporadasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una temporada por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.temporadasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una temporada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTemporadaDto,
  ) {
    return this.temporadasService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una temporada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.temporadasService.remove(id);
  }
}