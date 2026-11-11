import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

interface ErrorMysql {
  errno?: number;
  code?: string;
}

/**
 * Traduce los errores de MariaDB/MySQL a respuestas HTTP claras
 * (en vez de un 500 genérico) sin exponer el SQL al cliente.
 */
@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const driver = ((exception as unknown as { driverError?: ErrorMysql }).driverError ??
      exception) as ErrorMysql;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';

    switch (driver.errno) {
      case 1451: // borrar o cambiar algo que otros registros usan
        status = HttpStatus.CONFLICT;
        message =
          'No se puede eliminar este registro porque otros registros dependen de él';
        break;
      case 1452: // insertar algo con un id que no existe
        status = HttpStatus.BAD_REQUEST;
        message = 'Un registro relacionado no existe (revisa los IDs enviados)';
        break;
      case 1062: // valor duplicado en un campo único
        status = HttpStatus.CONFLICT;
        message = 'Ya existe un registro con esos datos';
        break;
      case 1048: // campo obligatorio vacío
        status = HttpStatus.BAD_REQUEST;
        message = 'Falta un campo obligatorio';
        break;
      default:
        this.logger.error(`${driver.code ?? 'DB'}: ${exception.message}`);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    });
  }
}