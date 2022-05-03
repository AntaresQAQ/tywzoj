import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserEntity } from '@/user/user.entity';

import { ProblemSampleEntity } from './problem-sample.entity';

export enum ProblemType {
  Traditional = 'Traditional',
  Interaction = 'Interaction',
  SubmitAnswer = 'SubmitAnswer',
}

@Entity('problem')
export class ProblemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: false })
  @Index({ unique: true })
  displayId: number;

  @Column({ type: 'varchar', length: 80, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  inputFormat: string;

  @Column({ type: 'text', nullable: true })
  outputFormat: string;

  @Column({ type: 'text', nullable: true })
  limitAndHint: string;

  @Column({
    type: 'enum',
    enum: ProblemType,
    default: ProblemType.Traditional,
    nullable: false,
  })
  type: ProblemType;

  @OneToMany(() => ProblemSampleEntity, problemSample => problemSample.problem)
  samples: Promise<ProblemSampleEntity[]>;

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  owner: Promise<UserEntity>;

  @Column()
  ownerId: number;

  @Column({ type: 'boolean' })
  isPublic: boolean;

  @Column({ type: 'datetime', nullable: true })
  publicTime: Date;

  @Column({ type: 'integer' })
  submissionCounter: number;

  @Column({ type: 'integer' })
  acceptedSubmissionCounter: number;
}
