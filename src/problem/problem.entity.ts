import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ProblemJudgeInfoEntity } from '@/problem/problem-judge-info.entity';
import { UserEntity } from '@/user/user.entity';

import { ProblemSampleEntity } from './problem-sample.entity';

export enum ProblemType {
  Traditional = 'Traditional',
  Interaction = 'Interaction',
  SubmitAnswer = 'SubmitAnswer',
}

export enum ProblemPermission {
  ALL = 'ALL',
  PAYING = 'PAYING',
  SCHOOL = 'SCHOOL',
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

  @Column({ type: 'enum', enum: ProblemPermission, default: ProblemPermission.ALL })
  permission: ProblemPermission;

  @Column({ type: 'integer' })
  submissionCount: number;

  @Column({ type: 'integer' })
  acceptedSubmissionCount: number;

  @OneToOne(() => ProblemJudgeInfoEntity, problemJudgeInfo => problemJudgeInfo.problem)
  judgeInfo: Promise<ProblemJudgeInfoEntity>;
}
