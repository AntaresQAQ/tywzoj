import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('problem_set')
export class ProblemSetEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 80, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;
}
