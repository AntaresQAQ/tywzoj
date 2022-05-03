import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum ProblemTagType {
  Algorithm = 'Algorithm',
  Datetime = 'Datetime',
  Origin = 'Origin',
  Other = 'Other',
}

@Entity('problem_tag')
export class ProblemTagEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 24, nullable: false })
  name: string;

  @Column({
    type: 'enum',
    enum: ProblemTagType,
    nullable: false,
    default: ProblemTagType.Other,
  })
  type: ProblemTagType;
}
