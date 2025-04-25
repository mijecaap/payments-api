import { ApiProperty } from '@nestjs/swagger';

export class ContactDto {
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
    description: 'Indica si el contacto fue referido por el usuario actual',
    example: true,
  })
  isReferred: boolean;
}
