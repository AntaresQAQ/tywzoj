import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { ProblemEntity } from "@/problem/problem.entity";
import { UserEntity } from "@/user/user.entity";

import { E_SubmissionStatus, ISubmissionEntity } from "./submission.types";

@Entity("submission")
export class SubmissionEntity implements ISubmissionEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", nullable: true, length: 36 })
    @Index()
    taskId: number;

    @Column({ type: "varchar", nullable: true, length: 20 })
    @Index()
    codeLang: string;

    @Column({ type: "text", nullable: true })
    code: string;

    @Column({ type: "integer", nullable: true })
    answerSize: number;

    @Column({ type: "integer", nullable: true })
    timeUsed: number;

    @Column({ type: "integer", nullable: true })
    memoryUsed: number;

    @Column({ type: "integer", nullable: true })
    @Index()
    score: number;

    @Column({ type: "enum", enum: E_SubmissionStatus })
    @Index()
    status: E_SubmissionStatus;

    @Column({ type: "datetime" })
    @Index()
    submitTime: Date;

    @ManyToOne(() => ProblemEntity, { onDelete: "CASCADE" })
    @JoinColumn()
    problem: Promise<ProblemEntity>;

    @Column()
    @Index()
    problemId: number;

    @ManyToOne(() => UserEntity)
    @JoinColumn()
    submitter: Promise<UserEntity>;

    @Column()
    @Index()
    submitterId: number;
}
