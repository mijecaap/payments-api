import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Candidate } from './candidate.entity';
import { Category } from './category.entity';

@Entity('proposals')
export class Proposal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  candidate_id: number;

  @Column()
  category_id: number;

  @Column({ type: 'varchar', length: 300 })
  title: string;

  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'text', nullable: true })
  detailed_description: string;

  @Column({ type: 'integer', default: 3 })
  priority_level: number; // 1=highest, 5=lowest

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  feasibility_score: number; // 1.00 - 5.00

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  estimated_cost: number; // Costo en soles

  @Column({ type: 'varchar', length: 50, nullable: true })
  implementation_timeline: string; // "immediate", "6_months", "1_year", "4_years"

  @Column({ type: 'text', nullable: true })
  target_beneficiaries: string;

  @Column({ type: 'text', nullable: true })
  expected_impact: string;

  @Column({ type: 'jsonb', nullable: true })
  source_documents: {
    name: string;
    url: string;
    type: string;
  }[];

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[];

  @Column({ type: 'boolean', default: true })
  is_published: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Relaciones
  @ManyToOne(() => Candidate, (candidate) => candidate.proposals, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'candidate_id' })
  candidate: Candidate;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}