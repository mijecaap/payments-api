import { Controller, Get, Param, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

import { GetUser } from '../auth/get-user.decorator';
import { AccountResponseDto } from '../dto/account.dto';
import { User } from '../entities/user.entity';
import { AccountService } from '../services/account.service';

@ApiTags('cuentas')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @ApiOperation({ summary: 'Obtener todas las cuentas del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cuentas del usuario',
    type: [AccountResponseDto],
  })
  @Get()
  async getUserAccounts(@GetUser() user: User): Promise<AccountResponseDto[]> {
    return await this.accountService.getUserAccounts(user.id);
  }

  @ApiOperation({ summary: 'Obtener saldo de una cuenta' })
  @ApiParam({ name: 'id', required: true, description: 'ID de la cuenta' })
  @ApiResponse({
    status: 200,
    description: 'Saldo de la cuenta',
    schema: {
      properties: {
        balance: { type: 'number', example: 1000 },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
  @Get(':id/balance')
  async getAccountBalance(@Param('id') id: number, @GetUser() user: User) {
    // Verificar que la cuenta pertenezca al usuario autenticado
    const hasAccess = await this.accountService.verifyAccountOwnership(id, user.id);
    if (!hasAccess) {
      throw new UnauthorizedException('No tienes permiso para acceder a esta cuenta');
    }
    return await this.accountService.getAccountBalance(id);
  }
}
