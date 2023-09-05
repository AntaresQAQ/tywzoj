import { Column, Entity, Index, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { AuthEntity } from "@/auth/auth.entity";
import { CE_UserLevel } from "@/common/user-level";
import { IUserEntity } from "@/user/user.types";
import { UserPreferenceEntity } from "@/user/user-preference.entity";

@Entity("user")
export class UserEntity implements IUserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 24 })
    @Index({ unique: true })
    username: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    @Index({ unique: true })
    email: string;

    @Column({ type: "boolean", default: false })
    publicEmail: boolean;

    @Column({ type: "varchar", length: 24, nullable: true })
    nickname: string;

    @Column({ type: "text", nullable: true })
    information: string;

    @Column({ type: "integer", nullable: false, default: CE_UserLevel.General })
    level: CE_UserLevel;

    @Column({ type: "integer", default: 0 })
    acceptedProblemCount: number;

    @Column({ type: "integer", default: 0 })
    submissionCount: number;

    @Column({ type: "integer", default: 1000 })
    rating: number;

    @Column({ type: "datetime", nullable: true })
    registrationTime: Date;

    @OneToOne(() => AuthEntity, (auth) => auth.user)
    auth: Promise<AuthEntity>;

    @OneToOne(() => UserPreferenceEntity, (preference) => preference.user)
    preference: Promise<UserPreferenceEntity>;
}
