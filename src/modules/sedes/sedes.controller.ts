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
  @ApiOperation({ summary: 'Obtener todas las sedes' })
  findAll() {
    return this.sedesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una sede por ID' })
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
  @ApiOperation({ summary: 'Eliminar una sede' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sedesService.remove(id);
  }
}
