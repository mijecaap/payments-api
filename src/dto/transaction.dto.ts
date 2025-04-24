import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'ID de la cuenta de origen',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  originAccountId: number;

  @ApiProperty({
    description: 'ID de la cuenta de destino',
    example: 2,
  })
  @IsNotEmpty()
  @IsNumber()
  destinationAccountId: number;

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
