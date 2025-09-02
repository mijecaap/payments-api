import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Candidate } from './candidate.entity';

@Entity('candidate_education')
export class CandidateEducation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  candidate_id: number;

  @Column({ type: 'varchar', length: 200 })
  institution_name: string;

  @Column({ type: 'varchar', length: 150 })
  degree: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  field_of_study: string;

  @Column({ type: 'integer', nullable: true })
  start_year: number;

  @Column({ type: 'integer', nullable: true })
  end_year: number;

  @Column({ type: 'boolean', default: true })
  is_completed: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  // Relaciones
  @ManyToOne(() => Candidate, (candidate) => candidate.education, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'candidate_id' })
  candidate: Candidate;
}