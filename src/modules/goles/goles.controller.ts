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
import { GolesService } from './goles.service.js';
import { CreateGolDto } from './dto/create-gol.dto.js';
import { UpdateGolDto } from './dto/update-gol.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import type { UserJwt } from '../auth/permisos.helper.js';

type Peticion = { user: UserJwt };

@ApiTags('Goles')
@ApiBearerAuth()
@Controller('goles')
export class GolesController {
  constructor(private readonly golesService: GolesService) {}

  @Post()
  @Roles('admin', 'arbitro')
  @ApiOperation({ summary: 'Registrar un gol' })
  create(@Body() createGolDto: CreateGolDto, @Req() req: Peticion) {
    return this.golesService.create(createGolDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los goles' })
  findAll() {
    return this.golesService.findAll();
  }

  @Get('partido/:partidoId')
  @ApiOperation({ summary: 'Obtener goles por partido' })
  findByPartido(@Param('partidoId', ParseIntPipe) partidoId: number) {
    return this.golesService.findByPartido(partidoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un gol por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.golesService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'arbitro')
  @ApiOperation({ summary: 'Actualizar un gol' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGolDto: UpdateGolDto,
    @Req() req: Peticion,
  ) {
    return this.golesService.update(id, updateGolDto, req.user);
  }

  @Delete(':id')
  @Roles('admin', 'arbitro')
  @ApiOperation({ summary: 'Eliminar un gol' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Peticion) {
    return this.golesService.remove(id, req.user);
  }
}