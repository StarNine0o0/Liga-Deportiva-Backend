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
import { JugadoresService } from './jugadores.service.js';
import { CreateJugadorDto } from './dto/create-jugadore.dto.js';
import { UpdateJugadorDto } from './dto/update-jugadore.dto.js';

@ApiTags('Jugadores')
@ApiBearerAuth()
@Controller('jugadores')
export class JugadoresController {
  constructor(private readonly jugadoresService: JugadoresService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un jugador' })
  create(@Body() dto: CreateJugadorDto) {
    return this.jugadoresService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los jugadores' })
  findAll() {
    return this.jugadoresService.findAll();
  }

  @Get('equipo/:equipoId')
  @ApiOperation({ summary: 'Obtener los jugadores de un equipo' })
  findByEquipo(@Param('equipoId', ParseIntPipe) equipoId: number) {
    return this.jugadoresService.findByEquipo(equipoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un jugador por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.jugadoresService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un jugador' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateJugadorDto,
  ) {
    return this.jugadoresService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un jugador' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.jugadoresService.remove(id);
  }
}