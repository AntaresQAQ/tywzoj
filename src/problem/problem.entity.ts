import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { CE_ProblemLevel, E_ProblemScope, E_ProblemType, IProblemEntity } from "@/problem/problem.types";
import { ProblemJudgeInfoEntity } from "@/problem/problem-judge-info.entity";
import { UserEntity } from "@/user/user.entity";

import { ProblemSampleEntity } from "./problem-sample.entity";

@Entity("problem")
export class ProblemEntity implements IProblemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "integer", nullable: true, default: null })
  @Index({ unique: true, nullFiltered: true })
  displayId: number;

  @Column({ type: "varchar", length: 80, nullable: false })
  title: string;

  @Column({ type: "text", nullable: true })
  subtitle: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "text", nullable: true })
  inputFormat: string;

  @Column({ type: "text", nullable: true })
  outputFormat: string;

  @Column({ type: "text", nullable: true })
  limitAndHint: string;

  @Column({
    type: "enum",
    enum: E_ProblemType,
    default: E_ProblemType.Traditional,
    nullable: false,
  })
  type: E_ProblemType;

  @OneToMany(() => ProblemSampleEntity, problemSample => problemSample.problem)
  samples: Promise<ProblemSampleEntity[]>;

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  owner: Promise<UserEntity>;

  @Column()
  ownerId: number;

  @Column({ type: "boolean" })
  isPublic: boolean;

  @Column({ type: "enum", enum: E_ProblemScope, default: E_ProblemScope.Personal })
  scope: E_ProblemScope;

  @Column({ type: "datetime", nullable: true })
  publicTime: Date;

  @Column({ type: "integer", default: CE_ProblemLevel.All })
  level: CE_ProblemLevel;

  @Column({ type: "integer", default: 0 })
  submissionCount: number;

  @Column({ type: "integer", default: 0 })
  acceptedSubmissionCount: number;

  @OneToOne(() => ProblemJudgeInfoEntity, problemJudgeInfo => problemJudgeInfo.problem)
  judgeInfo: Promise<ProblemJudgeInfoEntity>;
}
