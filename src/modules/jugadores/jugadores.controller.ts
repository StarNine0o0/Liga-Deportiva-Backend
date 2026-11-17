import {
  Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe,
  UploadedFile, UseInterceptors, Res, Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import type { Response } from 'express';
import { MAX_IMAGE_BYTES } from '../../common/uploads/image-storage.service.js';
import { JugadoresService } from './jugadores.service.js';
import { CreateJugadorDto } from './dto/create-jugadore.dto.js';
import { UpdateJugadorDto } from './dto/update-jugadore.dto.js';
import type { ArchivoSubido } from '../../common/uploads/image-storage.service.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import type { UserJwt } from '../auth/permisos.helper.js';

type Peticion = { user: UserJwt };

@ApiTags('Jugadores')
@ApiBearerAuth()
@Controller('jugadores')
export class JugadoresController {
  constructor(private readonly jugadoresService: JugadoresService) {}

  @Post()
  @Roles('admin', 'capitan', 'entrenador')
  @ApiOperation({ summary: 'Registrar un jugador' })
  create(@Body() dto: CreateJugadorDto, @Req() req: Peticion) {
    return this.jugadoresService.create(dto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener los jugadores visibles para tu rol' })
  findAll(@Req() req: Peticion) {
    return this.jugadoresService.findAll(req.user);
  }

  @Get('equipo/:equipoId')
  @ApiOperation({ summary: 'Obtener los jugadores de un equipo' })
  findByEquipo(
    @Param('equipoId', ParseIntPipe) equipoId: number,
    @Req() req: Peticion,
  ) {
    return this.jugadoresService.findByEquipo(equipoId, req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un jugador por ID' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Peticion) {
    return this.jugadoresService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles('admin', 'capitan', 'entrenador')
  @ApiOperation({ summary: 'Actualizar un jugador' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateJugadorDto,
    @Req() req: Peticion,
  ) {
    return this.jugadoresService.update(id, dto, req.user);
  }

  @Delete(':id')
  @Roles('admin', 'capitan', 'entrenador')
  @ApiOperation({ summary: 'Eliminar un jugador' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Peticion) {
    return this.jugadoresService.remove(id, req.user);
  }

  @Post(':id/foto')
  @Roles('admin', 'capitan', 'entrenador')
  @ApiOperation({ summary: 'Subir o reemplazar la foto de un jugador (JPG, PNG o WebP, máx. 2 MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: { type: 'object', properties: { foto: { type: 'string', format: 'binary' } } },
  })
  @UseInterceptors(FileInterceptor('foto', { limits: { fileSize: MAX_IMAGE_BYTES, files: 1 } }))
  uploadFoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() foto: ArchivoSubido | undefined,
    @Req() req: Peticion,
  ) {
    return this.jugadoresService.setFoto(id, foto, req.user);
  }

  @Get(':id/foto')
  @ApiOperation({ summary: 'Obtener la foto de un jugador' })
  async getFoto(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Peticion,
    @Res() res: Response,
  ) {
    const ruta = await this.jugadoresService.getFotoPath(id, req.user);
    res.set({
      'Cache-Control': 'private, max-age=300',
      'X-Content-Type-Options': 'nosniff',
    });
    res.sendFile(ruta, (err) => {
      if (err && !res.headersSent) {
        res.status(404).json({ message: 'Archivo de foto no encontrado' });
      }
    });
  }

  @Delete(':id/foto')
  @Roles('admin', 'capitan', 'entrenador')
  @ApiOperation({ summary: 'Quitar la foto de un jugador' })
  removeFoto(@Param('id', ParseIntPipe) id: number, @Req() req: Peticion) {
    return this.jugadoresService.removeFoto(id, req.user);
  }
}