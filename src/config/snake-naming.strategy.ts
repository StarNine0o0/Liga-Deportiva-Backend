import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';

/**
 * Estrategia de nombrado que convierte camelCase a snake_case automáticamente.
 * Esto evita usar @JoinColumn({ name: '...' }) y @Column({ name: '...' }) en las entidades.
 *
 * Ejemplos:
 *  - Propiedad `entrenadorNombre` → columna `entrenador_nombre`
 *  - Propiedad `createdAt`        → columna `created_at`
 *  - Relación  `rol`              → FK columna `rol_id`
 *  - Relación  `capitan`          → FK columna `capitan_id`
 */
export class SnakeNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  tableName(targetName: string, userSpecifiedName: string | undefined): string {
    return userSpecifiedName ?? this.toSnakeCase(targetName);
  }

  columnName(
    propertyName: string,
    customName: string | undefined,
    embeddedPrefixes: string[],
  ): string {
    const name = customName ?? this.toSnakeCase(propertyName);
    return embeddedPrefixes.length > 0
      ? embeddedPrefixes.join('_') + '_' + name
      : name;
  }

  relationName(propertyName: string): string {
    return this.toSnakeCase(propertyName);
  }

  joinColumnName(
    relationName: string,
    referencedColumnName: string,
  ): string {
    return this.toSnakeCase(relationName) + '_' + referencedColumnName;
  }

  joinTableName(
    firstTableName: string,
    secondTableName: string,
    _firstPropertyName: string,
    _secondPropertyName: string,
  ): string {
    return firstTableName + '_' + secondTableName;
  }

  joinTableColumnName(
    tableName: string,
    propertyName: string,
    columnName?: string,
  ): string {
    return tableName + '_' + (columnName ?? this.toSnakeCase(propertyName));
  }

  private toSnakeCase(str: string): string {
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
  }
}

