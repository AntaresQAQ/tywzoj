import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";

import { ProblemEntity } from "@/problem/problem.entity";

@Entity("problem_judge_info")
export class ProblemJudgeInfoEntity {
  @OneToOne(() => ProblemEntity, problem => problem.judgeInfo, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  problem: Promise<ProblemEntity>;

  @PrimaryColumn()
  problemId: number;

  @Column({ type: "integer" })
  timeLimit: number;

  @Column({ type: "integer" })
  memoryLimit: number;

  @Column({ type: "boolean", default: false })
  fileIO: boolean;

  @Column({ type: "varchar", length: 128, nullable: true })
  inputFile: string;

  @Column({ type: "varchar", length: 128, nullable: true })
  outputFile: string;
}
