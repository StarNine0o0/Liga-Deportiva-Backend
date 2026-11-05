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
import { TorneosService } from './torneos.service.js';
import { CreateTorneoDto } from './dto/create-torneo.dto.js';
import { UpdateTorneoDto } from './dto/update-torneo.dto.js';

@ApiTags('Torneos')
@ApiBearerAuth()
@Controller('torneos')
export class TorneosController {
  constructor(private readonly torneosService: TorneosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo torneo' })
  create(@Body() dto: CreateTorneoDto) {
    return this.torneosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los torneos' })
  findAll() {
    return this.torneosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un torneo por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.torneosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un torneo' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTorneoDto,
  ) {
    return this.torneosService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un torneo' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.torneosService.remove(id);
  }
}