import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { ProblemEntity } from "@/problem/problem.entity";
import { UserEntity } from "@/user/user.entity";

@Entity("user_problem_map")
export class UserProblemMapEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserEntity, {
        onDelete: "CASCADE",
    })
    @JoinColumn()
    user: Promise<UserEntity>;

    @Column()
    @Index()
    userId: number;

    @ManyToOne(() => ProblemEntity, {
        onDelete: "CASCADE",
    })
    @JoinColumn()
    problem: Promise<ProblemEntity>;

    @Column()
    @Index()
    problemId: number;
}
