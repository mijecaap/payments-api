import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from '../entities/candidate.entity';
import { CreateCandidateDto } from '../dto/create-candidate.dto';
import { SearchCandidatesDto } from '../dto/search-candidates.dto';

@Injectable()
export class CandidateService {
  constructor(
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
  ) {}

  async findAll(options?: { limit?: number; offset?: number }) {
    const { limit = 50, offset = 0 } = options || {};

    const [candidates, total] = await this.candidateRepository.findAndCount({
      relations: ['political_party', 'proposals', 'education', 'experience'],
      where: { is_active: true },
      order: { voting_intention: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      data: candidates.map(candidate => ({
        ...candidate,
        age: candidate.getAge(),
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  async getFeaturedCandidates() {
    const candidates = await this.candidateRepository.find({
      relations: ['political_party'],
      where: { 
        is_active: true,
        position: 'president',
      },
      order: { voting_intention: 'DESC' },
      take: 6, // Top 6 candidatos
    });

    return candidates.map(candidate => ({
      id: candidate.id,
      full_name: candidate.full_name,
      photo_url: candidate.photo_url,
      campaign_slogan: candidate.campaign_slogan,
      voting_intention: candidate.voting_intention,
      approval_rating: candidate.approval_rating,
      political_party: {
        name: candidate.political_party?.name,
        acronym: candidate.political_party?.acronym,
        logo_url: candidate.political_party?.logo_url,
      },
      age: candidate.getAge(),
    }));
  }

  async findOne(id: number) {
    const candidate = await this.candidateRepository.findOne({
      where: { id, is_active: true },
      relations: [
        'political_party',
        'proposals',
        'proposals.category',
        'education',
        'experience',
      ],
    });

    if (!candidate) {
      throw new NotFoundException(`Candidato con ID ${id} no encontrado`);
    }

    return {
      ...candidate,
      age: candidate.getAge(),
      proposals_count: candidate.proposals?.length || 0,
      education_count: candidate.education?.length || 0,
      experience_count: candidate.experience?.length || 0,
    };
  }

  async findByParty(partyId: number) {
    const candidates = await this.candidateRepository.find({
      relations: ['political_party'],
      where: { 
        political_party_id: partyId,
        is_active: true,
      },
      order: { position: 'ASC' }, // presidente primero, luego vicepresidentes
    });

    return candidates.map(candidate => ({
      ...candidate,
      age: candidate.getAge(),
    }));
  }

  async searchCandidates(searchDto: SearchCandidatesDto) {
    const { query, party_id, position, limit = 20 } = searchDto;

    const queryBuilder = this.candidateRepository
      .createQueryBuilder('candidate')
      .leftJoinAndSelect('candidate.political_party', 'party')
      .where('candidate.is_active = :isActive', { isActive: true });

    if (query) {
      queryBuilder.andWhere(
        '(candidate.full_name ILIKE :query OR candidate.profession ILIKE :query OR candidate.biography ILIKE :query)',
        { query: `%${query}%` }
      );
    }

    if (party_id) {
      queryBuilder.andWhere('candidate.political_party_id = :partyId', { partyId: party_id });
    }

    if (position) {
      queryBuilder.andWhere('candidate.position = :position', { position });
    }

    queryBuilder
      .orderBy('candidate.voting_intention', 'DESC')
      .take(limit);

    const candidates = await queryBuilder.getMany();

    return candidates.map(candidate => ({
      ...candidate,
      age: candidate.getAge(),
    }));
  }

  async getCandidateProposals(candidateId: number) {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId, is_active: true },
      relations: ['proposals', 'proposals.category'],
    });

    if (!candidate) {
      throw new NotFoundException(`Candidato con ID ${candidateId} no encontrado`);
    }

    const proposalsByCategory = candidate.proposals
      .filter(proposal => proposal.is_published)
      .reduce((acc, proposal) => {
        const categoryName = proposal.category.name;
        if (!acc[categoryName]) {
          acc[categoryName] = {
            category: proposal.category,
            proposals: [],
          };
        }
        acc[categoryName].proposals.push(proposal);
        return acc;
      }, {});

    return {
      candidate: {
        id: candidate.id,
        full_name: candidate.full_name,
        photo_url: candidate.photo_url,
      },
      proposals_by_category: Object.values(proposalsByCategory),
      total_proposals: candidate.proposals.length,
    };
  }

  async getCandidatePolls(candidateId: number) {
    // Esta implementación requeriría las entidades de encuestas
    // Por ahora retornamos datos mock
    return {
      candidate_id: candidateId,
      latest_polls: [
        {
          poll_name: 'Encuesta Nacional Enero 2024',
          polling_company: 'Ipsos',
          percentage: 22.3,
          position: 1,
          poll_date: '2024-01-15',
        },
        {
          poll_name: 'Pulso Perú Febrero 2024',
          polling_company: 'GfK',
          percentage: 24.1,
          position: 1,
          poll_date: '2024-02-10',
        },
      ],
    };
  }

  async getCandidateEvents(candidateId: number) {
    // Esta implementación requeriría las entidades de eventos
    // Por ahora retornamos datos mock
    return {
      candidate_id: candidateId,
      upcoming_events: [
        {
          title: 'Mitin en Lima',
          date: '2024-03-15T19:00:00Z',
          location: 'Plaza San Martín',
          type: 'rally',
        },
      ],
      past_events: [
        {
          title: 'Debate Presidencial',
          date: '2024-02-20T20:00:00Z',
          location: 'Universidad del Pacífico',
          type: 'debate',
        },
      ],
    };
  }

  async getCandidatesStats() {
    const totalCandidates = await this.candidateRepository.count({
      where: { is_active: true },
    });

    const candidatesByPosition = await this.candidateRepository
      .createQueryBuilder('candidate')
      .select('candidate.position', 'position')
      .addSelect('COUNT(*)', 'count')
      .where('candidate.is_active = :isActive', { isActive: true })
      .groupBy('candidate.position')
      .getRawMany();

    const avgVotingIntention = await this.candidateRepository
      .createQueryBuilder('candidate')
      .select('AVG(candidate.voting_intention)', 'avg_voting_intention')
      .where('candidate.is_active = :isActive', { isActive: true })
      .getRawOne();

    return {
      total_candidates: totalCandidates,
      candidates_by_position: candidatesByPosition,
      average_voting_intention: parseFloat(avgVotingIntention.avg_voting_intention) || 0,
      last_updated: new Date().toISOString(),
    };
  }

  async create(createCandidateDto: CreateCandidateDto) {
    const candidate = this.candidateRepository.create(createCandidateDto);
    return this.candidateRepository.save(candidate);
  }
}