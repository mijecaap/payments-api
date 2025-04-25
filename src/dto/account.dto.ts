import { ApiProperty } from '@nestjs/swagger';

export class AccountResponseDto {
  @ApiProperty({
    description: 'ID de la cuenta',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Número de cuenta',
    example: '3089379581',
  })
  accountNumber: string;

  @ApiProperty({
    description: 'Saldo disponible',
    example: 1000.0,
    type: 'number',
    format: 'decimal',
  })
  balance: number;

  @ApiProperty({
    description: 'ID de la cuenta que refirió esta cuenta (0 si no fue referida)',
    example: 0,
  })
  referred_by: number;

  @ApiProperty({
    description: 'Nombre del usuario que refirió esta cuenta',
    example: 'Juan Pérez',
    nullable: true,
  })
  referrerName: string | null;
}
