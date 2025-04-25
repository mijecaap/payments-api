import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'ID de la cuenta de origen',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  originAccountId: number;

  @ApiProperty({
    description: 'Número de cuenta del destinatario',
    example: '1234567890',
  })
  @IsNotEmpty()
  @Transform(({ value }: { value: string | number }) => String(value))
  destinationAccountNumber: string;

  @ApiProperty({
    description: 'Monto a transferir (mínimo S/ 0.10)',
    minimum: 0.1,
    example: 1.0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.1)
  amount: number;
}

export class TransactionHistoryQueryDto {
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

export class TransactionHistoryItemDto {
  @ApiProperty({
    description: 'Monto de la transacción (negativo si es salida, positivo si es entrada)',
    example: -100.5,
    type: Number,
  })
  amount: number;

  @ApiProperty({
    description: 'Comisión generada por la transacción',
    example: 1.0,
    type: Number,
  })
  commission: number;

  @ApiProperty({
    description: 'Fecha de la transacción',
    example: '2024-04-24T10:30:00Z',
    type: Date,
  })
  date: Date;

  @ApiProperty({
    description: 'Nombre del contacto (origen si es entrada, destino si es salida)',
    example: 'Juan Pérez',
    type: String,
  })
  contactName: string;
}

export class PaginatedTransactionHistoryDto {
  @ApiProperty({
    description: 'Lista de transacciones en la página actual',
    type: [TransactionHistoryItemDto],
  })
  transactions: TransactionHistoryItemDto[];

  @ApiProperty({
    description: 'Número total de transacciones',
    example: 50,
    type: Number,
  })
  total: number;

  @ApiProperty({
    description: 'Página actual',
    example: 1,
    type: Number,
  })
  page: number;

  @ApiProperty({
    description: 'Número total de páginas',
    example: 5,
    type: Number,
  })
  totalPages: number;
}

export class TransactionResponseDto {
  @ApiProperty({
    description: 'Monto de la transacción',
    example: 100.5,
    type: Number,
  })
  amount: number;

  @ApiProperty({
    description: 'Comisión cobrada por la transacción',
    example: 1.0,
    type: Number,
  })
  commission: number;

  @ApiProperty({
    description: 'Fecha de la transacción',
    example: '2024-04-24T10:30:00Z',
    type: Date,
  })
  date: Date;

  @ApiProperty({
    description: 'Nombre del destinatario',
    example: 'Juan Pérez',
    type: String,
  })
  destinationName: string;

  @ApiProperty({
    description: 'Número de cuenta del destinatario',
    example: '1234567890',
    type: String,
  })
  destinationAccountNumber: string;
}
