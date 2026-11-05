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
import { JornadasService } from './jornadas.service.js';
import { CreateJornadaDto } from './dto/create-jornada.dto.js';
import { UpdateJornadaDto } from './dto/update-jornada.dto.js';

@ApiTags('Jornadas')
@ApiBearerAuth()
@Controller('jornadas')
export class JornadasController {
  constructor(private readonly jornadasService: JornadasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una jornada' })
  create(@Body() dto: CreateJornadaDto) {
    return this.jornadasService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las jornadas' })
  findAll() {
    return this.jornadasService.findAll();
  }

  @Get('torneo/:torneoId')
  @ApiOperation({ summary: 'Obtener las jornadas de un torneo' })
  findByTorneo(@Param('torneoId', ParseIntPipe) torneoId: number) {
    return this.jornadasService.findByTorneo(torneoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una jornada por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.jornadasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una jornada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateJornadaDto,
  ) {
    return this.jornadasService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una jornada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.jornadasService.remove(id);
  }
}