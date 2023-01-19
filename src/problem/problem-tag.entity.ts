import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { IProblemTagEntity } from "@/problem/problem-tag.types";

import { ProblemTagTypeEntity } from "./problem-tag-type.entity";

@Entity("problem_tag")
export class ProblemTagEntity implements IProblemTagEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 24, nullable: false })
  @Index({ unique: true })
  name: string;

  @ManyToOne(() => ProblemTagTypeEntity, {
    onDelete: "SET NULL",
  })
  @JoinColumn()
  type: Promise<ProblemTagTypeEntity>;

  @Column({ nullable: true })
  @Index({ unique: false })
  typeId: number;

  @Column({ type: "integer", default: 100 })
  @Index({ unique: false })
  order: number;
}
