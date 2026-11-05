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
import { TorneoEquipoService } from './torneo-equipo.service.js';
import { CreateTorneoEquipoDto } from './dto/create-torneo-equipo.dto.js';
import { UpdateTorneoEquipoDto } from './dto/update-torneo-equipo.dto.js';

@ApiTags('Torneo-Equipo')
@ApiBearerAuth()
@Controller('torneo-equipo')
export class TorneoEquipoController {
  constructor(private readonly torneoEquipoService: TorneoEquipoService) {}

  @Post()
  @ApiOperation({ summary: 'Inscribir un equipo en un torneo' })
  create(@Body() createTorneoEquipoDto: CreateTorneoEquipoDto) {
    return this.torneoEquipoService.create(createTorneoEquipoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las inscripciones torneo-equipo' })
  findAll() {
    return this.torneoEquipoService.findAll();
  }

  @Get('torneo/:torneoId')
  @ApiOperation({ summary: 'Obtener equipos inscritos en un torneo' })
  findByTorneo(@Param('torneoId', ParseIntPipe) torneoId: number) {
    return this.torneoEquipoService.findByTorneo(torneoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una inscripción por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.torneoEquipoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar inscripción (estatus, pago, etc.)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTorneoEquipoDto: UpdateTorneoEquipoDto,
  ) {
    return this.torneoEquipoService.update(id, updateTorneoEquipoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar inscripción' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.torneoEquipoService.remove(id);
  }
}

