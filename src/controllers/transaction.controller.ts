import { Controller, Get, Post, Body, UseGuards, Param, Query, ParseIntPipe } from '@nestjs/common';
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
import {
  CreateTransactionDto,
  TransactionHistoryQueryDto,
  PaginatedTransactionHistoryDto,
} from '../dto/transaction.dto';
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
      createTransactionDto.destinationAccountNumber,
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

  @ApiOperation({
    summary: 'Obtener historial de transacciones de una cuenta específica',
    description:
      'Retorna el historial de transacciones paginado de una cuenta específica. ' +
      'Incluye montos (positivos para ingresos, negativos para egresos), ' +
      'comisiones, fechas y nombres de los contactos. ' +
      'Requiere autenticación y ser propietario de la cuenta.',
  })
  @ApiParam({
    name: 'accountId',
    description: 'ID de la cuenta para consultar el historial',
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
    description: 'Historial de transacciones paginado',
    type: PaginatedTransactionHistoryDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado o la cuenta no pertenece al usuario',
  })
  @Get('history/:accountId')
  async getAccountTransactionHistory(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query() query: TransactionHistoryQueryDto,
    @GetUser() user: User,
  ): Promise<PaginatedTransactionHistoryDto> {
    return await this.transactionService.getTransactionHistoryPaginated(
      accountId,
      user.id,
      query.page,
    );
  }
}
