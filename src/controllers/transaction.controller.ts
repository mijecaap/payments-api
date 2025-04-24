import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { GetUser } from '../auth/get-user.decorator';
import { CreateTransactionDto } from '../dto/transaction.dto';
import { User } from '../entities/user.entity';
import { TransactionService } from '../services/transaction.service';

@ApiTags('transacciones')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @ApiOperation({ summary: 'Realizar una transacción' })
  @ApiResponse({ status: 201, description: 'Transacción creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o saldo insuficiente' })
  @ApiResponse({ status: 401, description: 'No autorizado o cuenta no pertenece al usuario' })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
  @Post()
  async createTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
    @GetUser() user: User,
  ) {
    return await this.transactionService.createTransaction(
      createTransactionDto.originAccountId,
      createTransactionDto.destinationAccountId,
      createTransactionDto.amount,
      user.id,
    );
  }

  @ApiOperation({ summary: 'Obtener historial de transacciones' })
  @ApiResponse({ status: 200, description: 'Historial de transacciones' })
  @ApiResponse({ status: 404, description: 'Usuario no tiene cuentas asociadas' })
  @Get('history')
  async getTransactionHistory(@GetUser() user: User) {
    return await this.transactionService.getTransactionHistory(user.id);
  }
}
