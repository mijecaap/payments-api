import { ApiProperty } from '@nestjs/swagger';

export class FrequentContactDto {
  @ApiProperty({
    description: 'ID del usuario contacto',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nombre del contacto',
    example: 'Juan Pérez',
  })
  name: string;

  @ApiProperty({
    description: 'Email del contacto',
    example: 'juan@ejemplo.com',
  })
  email: string;

  @ApiProperty({
    description: 'ID de la cuenta del contacto',
    example: 1,
  })
  accountId: number;

  @ApiProperty({
    description: 'Número de transacciones realizadas con este contacto',
    example: 5,
  })
  transactionCount: number;
}
