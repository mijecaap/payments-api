import { Controller, Get, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

import { GetUser } from '../auth/get-user.decorator';
import { UserInfoDto } from '../dto/user.dto';
import { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';

@ApiTags('usuarios')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: 'Obtener información no sensible de un usuario',
    description:
      'Retorna información pública del usuario, incluyendo sus números de cuenta, ' +
      'relación de referidos y estadísticas de transacciones y comisiones. ' +
      'No se puede consultar la información propia ni la del usuario del sistema. ' +
      'Requiere autenticación.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario a consultar. No puede ser el ID propio ni el del sistema (1)',
    type: Number,
    example: 2,
  })
  @ApiResponse({
    status: 200,
    description: 'Información del usuario',
    type: UserInfoDto,
  })
  @ApiResponse({ status: 400, description: 'No se puede consultar el propio ID o el del sistema' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Get(':id')
  async getUserInfo(
    @Param('id', ParseIntPipe) targetUserId: number,
    @GetUser() currentUser: User,
  ): Promise<UserInfoDto> {
    return await this.userService.getUserInfo(targetUserId, currentUser.id);
  }
}
