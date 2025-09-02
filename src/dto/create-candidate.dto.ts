import { IsString, IsOptional, IsInt, IsDateString, IsUrl, IsEnum, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCandidateDto {
  @ApiProperty({
    description: 'Nombre del candidato',
    example: 'Juan',
  })
  @IsString()
  first_name: string;

  @ApiProperty({
    description: 'Apellido del candidato',
    example: 'Pérez',
  })
  @IsString()
  last_name: string;

  @ApiProperty({
    description: 'Fecha de nacimiento',
    example: '1970-05-15',
  })
  @IsDateString()
  date_of_birth: string;

  @ApiPropertyOptional({
    description: 'Lugar de nacimiento',
    example: 'Lima, Perú',
  })
  @IsOptional()
  @IsString()
  place_of_birth?: string;

  @ApiPropertyOptional({
    description: 'URL de la foto del candidato',
    example: 'https://example.com/photo.jpg',
  })
  @IsOptional()
  @IsUrl()
  photo_url?: string;

  @ApiPropertyOptional({
    description: 'Biografía del candidato',
    example: 'Político peruano con amplia experiencia...',
  })
  @IsOptional()
  @IsString()
  biography?: string;

  @ApiPropertyOptional({
    description: 'Profesión principal',
    example: 'Abogado',
  })
  @IsOptional()
  @IsString()
  profession?: string;

  @ApiPropertyOptional({
    description: 'ID del partido político',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  political_party_id?: number;

  @ApiPropertyOptional({
    description: 'Posición en la fórmula electoral',
    example: 'president',
    enum: ['president', 'vice_president_1', 'vice_president_2'],
  })
  @IsOptional()
  @IsEnum(['president', 'vice_president_1', 'vice_president_2'])
  position?: 'president' | 'vice_president_1' | 'vice_president_2';

  @ApiPropertyOptional({
    description: 'Eslogan de campaña',
    example: 'Un futuro mejor para todos',
  })
  @IsOptional()
  @IsString()
  campaign_slogan?: string;

  @ApiPropertyOptional({
    description: 'Sitio web de campaña',
    example: 'https://candidato2026.com',
  })
  @IsOptional()
  @IsUrl()
  campaign_website?: string;

  @ApiPropertyOptional({
    description: 'Redes sociales',
    example: {
      twitter: '@candidato',
      facebook: 'candidato.oficial',
      instagram: 'candidato_oficial',
    },
  })
  @IsOptional()
  social_media?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };

  @ApiPropertyOptional({
    description: 'Porcentaje de aprobación',
    example: 25.5,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  approval_rating?: number;

  @ApiPropertyOptional({
    description: 'Porcentaje de intención de voto',
    example: 22.3,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  voting_intention?: number;

  @ApiPropertyOptional({
    description: 'Si el candidato está activo',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}