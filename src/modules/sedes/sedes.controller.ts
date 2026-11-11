import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { MAX_IMAGE_BYTES } from '../../common/uploads/image-storage.service.js';
import type { ArchivoSubido } from '../../common/uploads/image-storage.service.js';
import { SedesService } from './sedes.service.js';
import { CreateSedeDto } from './dto/create-sede.dto.js';
import { UpdateSedeDto } from './dto/update-sede.dto.js';

@ApiTags('Sedes')
@ApiBearerAuth()
@Controller('sedes')
export class SedesController {
  constructor(private readonly sedesService: SedesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva sede' })
  create(@Body() createSedeDto: CreateSedeDto) {
    return this.sedesService.create(createSedeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las sedes (incluye imágenes)' })
  findAll() {
    return this.sedesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una sede por ID (incluye imágenes)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sedesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una sede' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSedeDto: UpdateSedeDto,
  ) {
    return this.sedesService.update(id, updateSedeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una sede (y sus imágenes)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sedesService.remove(id);
  }

  // ─────────────────────────────────────────────
  // IMÁGENES
  // ─────────────────────────────────────────────

  @Post(':id/imagenes')
  @ApiOperation({
    summary:
      'Subir una imagen de la sede (JPG, PNG o WebP, máx. 2 MB). Se agrega al final del carrusel.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { foto: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('foto', { limits: { fileSize: MAX_IMAGE_BYTES, files: 1 } }),
  )
  uploadImagen(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() foto: ArchivoSubido | undefined,
  ) {
    return this.sedesService.addImagen(id, foto);
  }

  @Get(':id/imagenes/:imagenId')
  @ApiOperation({ summary: 'Obtener una imagen de la sede (binario)' })
  async getImagen(
    @Param('id', ParseIntPipe) id: number,
    @Param('imagenId', ParseIntPipe) imagenId: number,
    @Res() res: Response,
  ) {
    const ruta = await this.sedesService.getImagenPath(id, imagenId);
    res.set({
      'Cache-Control': 'private, max-age=300',
      'X-Content-Type-Options': 'nosniff',
    });
    res.sendFile(ruta, (err) => {
      if (err && !res.headersSent) {
        res.status(404).json({ message: 'Archivo de imagen no encontrado' });
      }
    });
  }

  @Delete(':id/imagenes/:imagenId')
  @ApiOperation({ summary: 'Eliminar una imagen de la sede' })
  removeImagen(
    @Param('id', ParseIntPipe) id: number,
    @Param('imagenId', ParseIntPipe) imagenId: number,
  ) {
    return this.sedesService.removeImagen(id, imagenId);
  }
}