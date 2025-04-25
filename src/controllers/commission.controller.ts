import { Controller, Get, UseGuards, Query, Param, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { GetUser } from '../auth/get-user.decorator';
import { CommissionQueryDto, PaginatedCommissionsResponseDto } from '../dto/commission.dto';
import { User } from '../entities/user.entity';
import { CommissionService } from '../services/commission.service';

@ApiTags('comisiones')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('commissions')
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) {}

  @ApiOperation({
    summary: 'Consultar comisiones generadas para una cuenta específica',
    description:
      'Retorna el listado paginado de comisiones para una cuenta específica. ' +
      'Incluye información del origen de la comisión y el monto total acumulado. ' +
      'Requiere autenticación y ser propietario de la cuenta.',
  })
  @ApiParam({
    name: 'accountId',
    description: 'ID de la cuenta para consultar las comisiones',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'page',
    description: 'Número de página (por defecto: 1)',
    required: false,
    type: Number,
    example: 1,
    minimum: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de comisiones',
    type: PaginatedCommissionsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado o la cuenta no pertenece al usuario',
  })
  @Get(':accountId')
  async getCommissions(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query() query: CommissionQueryDto,
    @GetUser() user: User,
  ): Promise<PaginatedCommissionsResponseDto> {
    return await this.commissionService.getCommissionsByAccount(accountId, user.id, query.page);
  }
}
