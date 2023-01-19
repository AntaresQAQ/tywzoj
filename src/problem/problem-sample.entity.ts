import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { IProblemSampleEntity } from "@/problem/problem-sample.types";

import { ProblemEntity } from "./problem.entity";

@Entity("problem_sample")
export class ProblemSampleEntity implements IProblemSampleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProblemEntity, problem => problem.samples, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  problem: Promise<ProblemEntity>;

  @Column()
  problemId: number;

  @Column({ type: "text", nullable: true })
  input: string;

  @Column({ type: "text", nullable: true })
  output: string;

  @Column({ type: "text", nullable: true })
  explanation: string;
}
