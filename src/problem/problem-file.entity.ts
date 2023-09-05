import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { ProblemEntity } from "@/problem/problem.entity";
import { IProblemEntity } from "@/problem/problem.types";

import { E_ProblemFileType, IProblemFileEntity } from "./problem-file.type";

@Entity("problem_file")
export class ProblemFileEntity implements IProblemFileEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ProblemEntity)
    @JoinColumn()
    problem: Promise<IProblemEntity>;

    @Column()
    @Index()
    problemId: number;

    @Column({ type: "char", length: 36 })
    uuid: string;

    @Column({ type: "varchar", length: 256 })
    filename: string;

    @Column({ type: "enum", enum: E_ProblemFileType })
    type: E_ProblemFileType;
}
