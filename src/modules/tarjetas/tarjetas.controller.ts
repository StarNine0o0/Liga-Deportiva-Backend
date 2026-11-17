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
import { TarjetasService } from './tarjetas.service.js';
import { CreateTarjetaDto } from './dto/create-tarjeta.dto.js';
import { UpdateTarjetaDto } from './dto/update-tarjeta.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import type { UserJwt } from '../auth/permisos.helper.js';

type Peticion = { user: UserJwt };

@ApiTags('Tarjetas')
@ApiBearerAuth()
@Controller('tarjetas')
export class TarjetasController {
  constructor(private readonly tarjetasService: TarjetasService) {}

  @Post()
  @Roles('admin', 'arbitro')
  @ApiOperation({ summary: 'Registrar una tarjeta' })
  create(@Body() dto: CreateTarjetaDto, @Req() req: Peticion) {
    return this.tarjetasService.create(dto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener las tarjetas visibles para tu rol' })
  findAll(@Req() req: Peticion) {
    return this.tarjetasService.findAll(req.user);
  }

  @Get('partido/:partidoId')
  @ApiOperation({ summary: 'Obtener las tarjetas de un partido' })
  findByPartido(
    @Param('partidoId', ParseIntPipe) partidoId: number,
    @Req() req: Peticion,
  ) {
    return this.tarjetasService.findByPartido(partidoId, req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una tarjeta por ID' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Peticion) {
    return this.tarjetasService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles('admin', 'arbitro')
  @ApiOperation({ summary: 'Actualizar una tarjeta' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTarjetaDto,
    @Req() req: Peticion,
  ) {
    return this.tarjetasService.update(id, dto, req.user);
  }

  @Delete(':id')
  @Roles('admin', 'arbitro')
  @ApiOperation({ summary: 'Eliminar una tarjeta' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Peticion) {
    return this.tarjetasService.remove(id, req.user);
  }
}