import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { PoliticalParty } from './political-party.entity';
import { Proposal } from './proposal.entity';
import { CandidateEducation } from './candidate-education.entity';
import { CandidateExperience } from './candidate-experience.entity';

@Entity('candidates')
export class Candidate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  first_name: string;

  @Column({ type: 'varchar', length: 100 })
  last_name: string;

  @Column({ 
    type: 'varchar', 
    length: 200,
    generated: 'STORED',
    generatedType: 'STORED',
    asExpression: `first_name || ' ' || last_name`
  })
  full_name: string;

  @Column({ type: 'date' })
  date_of_birth: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  place_of_birth: string;

  @Column({ type: 'text', nullable: true })
  photo_url: string;

  @Column({ type: 'text', nullable: true })
  biography: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  profession: string;

  @Column({ nullable: true })
  political_party_id: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'president',
  })
  position: 'president' | 'vice_president_1' | 'vice_president_2';

  @Column({ type: 'varchar', length: 200, nullable: true })
  campaign_slogan: string;

  @Column({ type: 'text', nullable: true })
  campaign_website: string;

  @Column({ type: 'jsonb', nullable: true })
  social_media: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.00 })
  approval_rating: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.00 })
  voting_intention: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Relaciones
  @ManyToOne(() => PoliticalParty, (party) => party.candidates)
  @JoinColumn({ name: 'political_party_id' })
  political_party: PoliticalParty;

  @OneToMany(() => Proposal, (proposal) => proposal.candidate)
  proposals: Proposal[];

  @OneToMany(() => CandidateEducation, (education) => education.candidate)
  education: CandidateEducation[];

  @OneToMany(() => CandidateExperience, (experience) => experience.candidate)
  experience: CandidateExperience[];

  // Método para calcular edad
  getAge(): number {
    const today = new Date();
    const birthDate = new Date(this.date_of_birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}