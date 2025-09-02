import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { Candidate } from './candidate.entity';

@Entity('political_parties')
export class PoliticalParty {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 10, unique: true })
  acronym: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ideology: string;

  @Column({ type: 'date', nullable: true })
  founding_date: Date;

  @Column({ type: 'text', nullable: true })
  logo_url: string;

  @Column({ type: 'text', nullable: true })
  website_url: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: false })
  is_coalition: boolean;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'active',
  })
  status: 'active' | 'inactive' | 'suspended';

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Relaciones
  @OneToMany(() => Candidate, (candidate) => candidate.political_party)
  candidates: Candidate[];
}