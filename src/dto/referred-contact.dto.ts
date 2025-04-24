import { ApiProperty } from '@nestjs/swagger';

export class ReferredContactDto {
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
    description: 'Indica si este contacto es quien refirió al usuario',
    example: false,
  })
  isReferrer: boolean;

  @ApiProperty({
    description: 'Indica si este contacto fue referido por el usuario',
    example: true,
  })
  isReferred: boolean;
}
