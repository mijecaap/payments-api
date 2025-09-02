import { IsString, IsOptional, IsInt, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class SearchCandidatesDto {
  @ApiPropertyOptional({
    description: 'Término de búsqueda (nombre, profesión, biografía)',
    example: 'economista',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    description: 'ID del partido político',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  party_id?: number;

  @ApiPropertyOptional({
    description: 'Posición en la fórmula electoral',
    example: 'president',
    enum: ['president', 'vice_president_1', 'vice_president_2'],
  })
  @IsOptional()
  @IsEnum(['president', 'vice_president_1', 'vice_president_2'])
  position?: 'president' | 'vice_president_1' | 'vice_president_2';

  @ApiPropertyOptional({
    description: 'Número máximo de resultados',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  limit?: number;
}