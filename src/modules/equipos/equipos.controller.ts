import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EquiposService } from './equipos.service.js';
import { CreateEquipoDto } from './dto/create-equipo.dto.js';
import { UpdateEquipoDto } from './dto/update-equipo.dto.js';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ImageStorageService,
  MAX_IMAGE_BYTES,
  type ArchivoSubido,
} from '../../common/uploads/image-storage.service.js';

@ApiTags('Equipos')
@ApiBearerAuth()
@Controller('equipos')
export class EquiposController {
  constructor(
    private readonly equiposService: EquiposService,
    @Inject(ImageStorageService)
    private readonly imageStorageService: ImageStorageService,
  ) {}

  @Post('upload-logo')
  @ApiOperation({ summary: 'Subir escudo de equipo (JPG, PNG, WebP máx 2MB)' })
  @UseInterceptors(
    FileInterceptor('foto', {
      limits: { fileSize: MAX_IMAGE_BYTES },
    }),
  )
  async uploadLogo(@UploadedFile() file: ArchivoSubido) {
    const filename = await this.imageStorageService.save('equipos', file);
    return { logoUrl: `/uploads/equipos/${filename}` };
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo equipo' })
  create(@Body() createEquipoDto: CreateEquipoDto) {
    return this.equiposService.create(createEquipoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los equipos' })
  findAll() {
    return this.equiposService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un equipo por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.equiposService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un equipo' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEquipoDto: UpdateEquipoDto,
  ) {
    return this.equiposService.update(id, updateEquipoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un equipo' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.equiposService.remove(id);
  }
}