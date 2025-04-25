import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsNumber, Min, IsOptional } from 'class-validator';

export class CommissionQueryDto {
  @ApiProperty({
    description: 'Número de página para la paginación',
    example: 1,
    required: false,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Transform(({ value }: { value: string | number }) => parseInt(String(value)))
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page: number = 1;
}

export class CommissionResponseDto {
  @ApiProperty({
    description: 'ID de la comisión',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Monto de la comisión',
    example: 1.0,
    type: 'number',
  })
  amount: number;

  @ApiProperty({
    description: 'Fecha de la comisión',
    example: '2024-04-24T10:30:00Z',
  })
  date: Date;

  @ApiProperty({
    description: 'Nombre del usuario que generó la comisión',
    example: 'Juan Pérez',
  })
  originUserName: string;

  @ApiProperty({
    description: 'Número de cuenta que generó la comisión',
    example: '1234567890',
  })
  originAccountNumber: string;

  @ApiProperty({
    description: 'Monto de la transacción que generó la comisión',
    example: 100.0,
    type: 'number',
  })
  transactionAmount: number;
}

export class PaginatedCommissionsResponseDto {
  @ApiProperty({
    description: 'Lista de comisiones',
    type: [CommissionResponseDto],
  })
  commissions: CommissionResponseDto[];

  @ApiProperty({
    description: 'Suma total de todas las comisiones recibidas',
    example: 25.5,
    type: 'number',
  })
  totalCommissions: number;

  @ApiProperty({
    description: 'Número total de comisiones',
    example: 50,
    type: 'number',
  })
  total: number;

  @ApiProperty({
    description: 'Página actual',
    example: 1,
    type: 'number',
  })
  page: number;

  @ApiProperty({
    description: 'Número total de páginas',
    example: 5,
    type: 'number',
  })
  totalPages: number;
}
