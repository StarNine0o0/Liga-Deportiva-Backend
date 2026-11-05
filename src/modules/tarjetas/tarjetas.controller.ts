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
import { TarjetasService } from './tarjetas.service.js';
import { CreateTarjetaDto } from './dto/create-tarjeta.dto.js';
import { UpdateTarjetaDto } from './dto/update-tarjeta.dto.js';

@ApiTags('Tarjetas')
@ApiBearerAuth()
@Controller('tarjetas')
export class TarjetasController {
  constructor(private readonly tarjetasService: TarjetasService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una tarjeta' })
  create(@Body() dto: CreateTarjetaDto) {
    return this.tarjetasService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las tarjetas' })
  findAll() {
    return this.tarjetasService.findAll();
  }

  @Get('partido/:partidoId')
  @ApiOperation({ summary: 'Obtener las tarjetas de un partido' })
  findByPartido(@Param('partidoId', ParseIntPipe) partidoId: number) {
    return this.tarjetasService.findByPartido(partidoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una tarjeta por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tarjetasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una tarjeta' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTarjetaDto,
  ) {
    return this.tarjetasService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una tarjeta' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tarjetasService.remove(id);
  }
}