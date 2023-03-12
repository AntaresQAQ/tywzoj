import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

import { IProblemTagTypeEntity } from "./problem-tag-type.types";

@Entity("problem_tag_type")
export class ProblemTagTypeEntity implements IProblemTagTypeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 24, nullable: false })
  name: string;

  @Column({ type: "char", length: 8, nullable: false })
  color: string;

  @Column({ type: "integer", default: 100 })
  @Index({ unique: false })
  order: number;
}
