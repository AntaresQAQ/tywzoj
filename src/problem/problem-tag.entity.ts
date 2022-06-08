import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

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
  @Index({ unique: true })
  name: string;

  @Column({
    type: 'enum',
    enum: ProblemTagType,
    nullable: false,
    default: ProblemTagType.Other,
  })
  @Index({ unique: false })
  type: ProblemTagType;

  @Column({ type: 'integer', default: 100 })
  @Index({ unique: false })
  order: number;
}
