import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Candidate } from './candidate.entity';

@Entity('candidate_experience')
export class CandidateExperience {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  candidate_id: number;

  @Column({ type: 'varchar', length: 150 })
  position_title: string;

  @Column({ type: 'varchar', length: 200 })
  organization: string;

  @Column({ type: 'date', nullable: true })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date: Date;

  @Column({ type: 'boolean', default: false })
  is_current: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'professional',
  })
  experience_type: 'professional' | 'political' | 'academic' | 'volunteer';

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  // Relaciones
  @ManyToOne(() => Candidate, (candidate) => candidate.experience, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'candidate_id' })
  candidate: Candidate;
}