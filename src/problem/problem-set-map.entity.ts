import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ProblemEntity } from './problem.entity';
import { ProblemSetEntity } from './problem-set.entity';

@Entity('problem_set_map')
@Index(['problemSetId', 'problemId'], { unique: true })
export class ProblemSetMapEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', default: 100 })
  sortIndex: number;

  @ManyToOne(() => ProblemSetEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  problemSet: Promise<ProblemSetEntity>;

  @Column()
  @Index()
  problemSetId: number;

  @ManyToOne(() => ProblemEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  problem: Promise<ProblemEntity>;

  @Column()
  problemId: number;
}
