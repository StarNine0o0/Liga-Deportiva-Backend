import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

/** Forma mínima del archivo que entrega multer (guardado en memoria) */
export interface ArchivoSubido {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB

const EXTENSIONES = { jpeg: 'jpg', png: 'png', webp: 'webp' } as const;

/** Detecta el formato real leyendo los primeros bytes (no confía en el nombre ni en el mimetype). */
function detectarTipo(buf: Buffer): keyof typeof EXTENSIONES | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'jpeg';
  }
  if (
    buf.length >= 8 &&
    buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return 'png';
  }
  if (
    buf.length >= 12 &&
    buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buf.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'webp';
  }
  return null;
}

@Injectable()
export class ImageStorageService {
  private readonly raiz = join(process.cwd(), 'uploads');

  /** Valida y guarda la imagen con nombre aleatorio. Regresa solo el nombre del archivo. */
    async save(carpeta: string, file: ArchivoSubido | undefined): Promise<string> {
    if (!file) {
      throw new BadRequestException('Falta el archivo (campo "foto")');
    }
    const tipo = detectarTipo(file.buffer);
    if (!tipo) {
      throw new BadRequestException('Formato no permitido. Usa JPG, PNG o WebP');
    }
    const nombre = `${randomUUID()}.${EXTENSIONES[tipo]}`;
    const dir = join(this.raiz, carpeta);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, nombre), file.buffer);
    return nombre;
  }

  pathOf(carpeta: string, nombre: string): string {
    return join(this.raiz, carpeta, basename(nombre));
  }

  async remove(carpeta: string, nombre: string): Promise<void> {
    try {
      await unlink(this.pathOf(carpeta, nombre));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
    }
  }
}
