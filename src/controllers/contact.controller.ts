import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { GetUser } from '../auth/get-user.decorator';
import { FrequentContactDto } from '../dto/frequent-contact.dto';
import { ReferredContactDto } from '../dto/referred-contact.dto';
import { User } from '../entities/user.entity';
import { ContactService } from '../services/contact.service';

@ApiTags('contactos')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('contacts')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @ApiOperation({ summary: 'Obtener lista de contactos frecuentes' })
  @ApiResponse({
    status: 200,
    description: 'Lista de contactos frecuentes',
    type: [FrequentContactDto],
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Get('frequent')
  async getFrequentContacts(@GetUser() user: User): Promise<FrequentContactDto[]> {
    return await this.contactService.getFrequentContacts(user.id);
  }

  @ApiOperation({ summary: 'Obtener lista de contactos referidos y referidor' })
  @ApiResponse({
    status: 200,
    description: 'Lista de contactos referidos',
    type: [ReferredContactDto],
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Get('referred')
  async getReferredContacts(@GetUser() user: User): Promise<ReferredContactDto[]> {
    return await this.contactService.getReferredContacts(user.id);
  }
}
