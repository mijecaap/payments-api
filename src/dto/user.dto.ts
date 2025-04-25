import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan Pérez',
  })
  name: string;

  @ApiProperty({
    description: 'Lista de números de cuenta del usuario',
    example: ['1234567890', '0987654321'],
    type: [String],
  })
  accountNumbers: string[];

  @ApiProperty({
    description: 'Indica si este usuario te refirió',
    example: false,
  })
  isReferrer: boolean;

  @ApiProperty({
    description: 'Indica si este usuario fue referido por ti',
    example: true,
  })
  isReferred: boolean;

  @ApiProperty({
    description: 'Total de transacciones que le has realizado',
    example: 5,
  })
  totalTransactionsToUser: number;

  @ApiProperty({
    description: 'Monto total de comisiones que te ha generado',
    example: 25.5,
    type: 'number',
  })
  totalCommissionsGenerated: number;
}
