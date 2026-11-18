import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PartidosService } from './partidos.service.js';
import { CreatePartidoDto } from './dto/create-partido.dto.js';
import { UpdatePartidoDto } from './dto/update-partido.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import type { UserJwt } from '../auth/permisos.helper.js';
import { LiguillaService } from '../liguilla/liguilla.service.js';

@ApiTags('Partidos')
@ApiBearerAuth()
@Controller('partidos')
export class PartidosController {
  constructor(
    private readonly partidosService: PartidosService,
    private readonly liguillaService: LiguillaService,
  ) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Crear un partido' })
  create(@Body() dto: CreatePartidoDto) {
    return this.partidosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener los partidos visibles para tu rol' })
  findAll(@Req() req: { user: UserJwt }) {
    return this.partidosService.findAll(req.user);
  }

  @Get('jornada/:jornadaId')
  @ApiOperation({ summary: 'Obtener los partidos de una jornada' })
  findByJornada(
    @Param('jornadaId', ParseIntPipe) jornadaId: number,
    @Req() req: { user: UserJwt },
  ) {
    return this.partidosService.findByJornada(jornadaId, req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un partido por ID' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: UserJwt },
  ) {
    return this.partidosService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles('admin', 'arbitro')
  @ApiOperation({ summary: 'Actualizar un partido (avanza la liguilla si aplica)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePartidoDto,
    @Req() req: { user: UserJwt },
  ) {
    const partido = await this.partidosService.update(id, dto, req.user);
    const aviso = await this.liguillaService.procesarPartido(partido);
    return aviso ? { ...partido, avisoLiguilla: aviso } : partido;
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Eliminar un partido' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.partidosService.remove(id);
  }
}