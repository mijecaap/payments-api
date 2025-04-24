import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { CommissionService } from '../services/commission.service';

@ApiTags('comisiones')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('commissions')
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) {}

  @ApiOperation({ summary: 'Consultar comisiones generadas' })
  @ApiResponse({ status: 200, description: 'Lista de comisiones' })
  @Get()
  async getCommissions() {
    return await this.commissionService.getCommissions();
  }
}
