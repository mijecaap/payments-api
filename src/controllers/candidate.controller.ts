import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CandidateService } from '../services/candidate.service';
import { CreateCandidateDto } from '../dto/create-candidate.dto';
import { SearchCandidatesDto } from '../dto/search-candidates.dto';

@ApiTags('Candidatos')
@Controller('api/candidates')
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los candidatos activos' })
  @ApiResponse({ status: 200, description: 'Lista de candidatos obtenida exitosamente' })
  @ApiQuery({ name: 'limit', required: false, description: 'Número máximo de resultados' })
  @ApiQuery({ name: 'offset', required: false, description: 'Número de resultados a omitir' })
  async findAll(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.candidateService.findAll({ limit, offset });
  }

  @Get('featured')
  @ApiOperation({ summary: 'Obtener candidatos destacados (principales)' })
  @ApiResponse({ status: 200, description: 'Candidatos principales obtenidos exitosamente' })
  async getFeaturedCandidates() {
    return this.candidateService.getFeaturedCandidates();
  }

  @Get('by-party/:partyId')
  @ApiOperation({ summary: 'Obtener candidatos por partido político' })
  @ApiResponse({ status: 200, description: 'Candidatos del partido obtenidos exitosamente' })
  async findByParty(@Param('partyId') partyId: number) {
    return this.candidateService.findByParty(partyId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar candidatos por nombre o criterios' })
  @ApiResponse({ status: 200, description: 'Resultados de búsqueda obtenidos exitosamente' })
  async searchCandidates(@Query() searchDto: SearchCandidatesDto) {
    return this.candidateService.searchCandidates(searchDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas generales de candidatos' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  async getCandidatesStats() {
    return this.candidateService.getCandidatesStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener candidato por ID' })
  @ApiResponse({ status: 200, description: 'Candidato obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Candidato no encontrado' })
  async findOne(@Param('id') id: number) {
    return this.candidateService.findOne(id);
  }

  @Get(':id/proposals')
  @ApiOperation({ summary: 'Obtener propuestas de un candidato' })
  @ApiResponse({ status: 200, description: 'Propuestas del candidato obtenidas exitosamente' })
  async getCandidateProposals(@Param('id') id: number) {
    return this.candidateService.getCandidateProposals(id);
  }

  @Get(':id/polls')
  @ApiOperation({ summary: 'Obtener resultados de encuestas de un candidato' })
  @ApiResponse({ status: 200, description: 'Resultados de encuestas obtenidos exitosamente' })
  async getCandidatePolls(@Param('id') id: number) {
    return this.candidateService.getCandidatePolls(id);
  }

  @Get(':id/events')
  @ApiOperation({ summary: 'Obtener eventos de campaña de un candidato' })
  @ApiResponse({ status: 200, description: 'Eventos de campaña obtenidos exitosamente' })
  async getCandidateEvents(@Param('id') id: number) {
    return this.candidateService.getCandidateEvents(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo candidato (Admin)' })
  @ApiResponse({ status: 201, description: 'Candidato creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() createCandidateDto: CreateCandidateDto) {
    return this.candidateService.create(createCandidateDto);
  }
}