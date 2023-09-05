import { Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import crypto from "crypto";
import { DataSource, Like, Repository } from "typeorm";

import { AuthEntity } from "@/auth/auth.entity";
import { CE_Permission, checkIsAllowed } from "@/common/user-level";
import { ProblemEntity } from "@/problem/problem.entity";
import { E_ProblemScope } from "@/problem/problem.types";

import { UserEntity } from "./user.entity";
import { IUserAtomicEntityWithExtra, IUserBaseEntityWithExtra, IUserEntityWithExtra } from "./user.types";
import { UserPreferenceEntity } from "./user-preference.entity";
import { IUserPreferenceEntityWithExtra } from "./user-preference.types";

@Injectable()
export class UserService {
    public constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(UserPreferenceEntity)
        private readonly userPreferenceRepository: Repository<UserPreferenceEntity>,
    ) {}

    public async findUserByIdAsync(id: number): Promise<UserEntity> {
        return await this.userRepository.findOne({ where: { id } });
    }

    public async findUserByUsernameAsync(username: string): Promise<UserEntity> {
        return await this.userRepository.findOne({ where: { username } });
    }

    public async findUserByEmailAsync(email: string): Promise<UserEntity> {
        return await this.userRepository.findOne({ where: { email } });
    }

    public async findUserListAsync(
        sortBy: "acceptedProblemCount" | "rating" | "id",
        skipCount: number,
        takeCount: number,
    ): Promise<[users: UserEntity[], count: number]> {
        return await this.userRepository.findAndCount({
            order: {
                [sortBy]: sortBy === "id" ? "ACS" : "DESC",
            },
            skip: skipCount,
            take: takeCount,
        });
    }

    public async searchUsersByUsernameAsync(keyword: string, take: number): Promise<UserEntity[]> {
        return await this.userRepository.find({ where: { username: Like(`%${keyword}%`) }, take });
    }

    public async updateUserAsync(id: number, user: Partial<UserEntity>) {
        delete user.id;
        return await this.userRepository.update(id, user);
    }

    public async updateUserPreferenceAsync(userId: number, userPreference: Partial<UserPreferenceEntity>) {
        delete userPreference.userId;
        delete userPreference.user;
        return await this.userPreferenceRepository.update(userId, userPreference);
    }

    public async deleteUserAsync(user: UserEntity) {
        await this.dataSource.transaction("READ COMMITTED", async (entityManager) => {
            // TODO: Delete all dependencies

            // Delete all personal problems
            await entityManager.delete(ProblemEntity, { ownerId: user.id, scope: E_ProblemScope.Personal });

            // Delete user preference
            await entityManager.delete(UserPreferenceEntity, { userId: user.id });

            // Delete auth
            await entityManager.delete(AuthEntity, { userId: user.id });

            // Delete user
            await entityManager.remove(user);
        });
    }

    private static getUserAvatar(user: UserEntity) {
        if (!user.email) return null;
        return crypto.createHash("md5").update(user.email.trim().toLowerCase()).digest("hex");
    }

    public getUserAtomicDetail(user: UserEntity): IUserAtomicEntityWithExtra {
        return {
            id: user.id,
            username: user.username,
            avatar: UserService.getUserAvatar(user),
        };
    }

    /**
     * If the current user is ADMIN or self, the email will be returned
     * even if the user set public email to false.
     */
    public getUserBaseDetail(user: UserEntity, currentUser: UserEntity): IUserBaseEntityWithExtra {
        const shouldReturnEmail = user.publicEmail || this.checkIsAllowedEdit(user, currentUser);

        return {
            ...this.getUserAtomicDetail(user),
            email: shouldReturnEmail ? user.email : null,
            nickname: user.nickname,
            level: user.level,
            information: user.information,
        };
    }

    public getUserDetail(user: UserEntity, currentUser: UserEntity): IUserEntityWithExtra {
        return {
            ...this.getUserBaseDetail(user, currentUser),
            rating: user.rating,
            acceptedProblemCount: user.acceptedProblemCount,
            submissionCount: user.submissionCount,
            registrationTime: user.registrationTime,
        };
    }

    public async getUserPreferenceAsync(user: UserEntity): Promise<IUserPreferenceEntityWithExtra> {
        let preference = await user.preference;
        if (!preference) {
            preference = new UserPreferenceEntity();
            preference.userId = user.id;
            await this.userPreferenceRepository.save(preference);
            preference = await user.preference;
        }
        delete preference.userId;
        delete preference.user;
        return preference;
    }

    public async checkUsernameAvailabilityAsync(username: string): Promise<boolean> {
        return (await this.userRepository.count({ where: { username } })) === 0;
    }

    public async checkEmailAvailabilityAsync(email: string): Promise<boolean> {
        return (await this.userRepository.count({ where: { email } })) === 0;
    }

    public checkIsAllowedEdit(user: UserEntity, currentUser: UserEntity) {
        return (
            this.checkIsAllowedView(currentUser) &&
            (user.id === currentUser.id || this.checkIsAllowedManage(user, currentUser))
        );
    }

    public checkIsAllowedManage(user: UserEntity, currentUser: UserEntity) {
        return (
            checkIsAllowed(currentUser.level, CE_Permission.ManageUser) &&
            (currentUser.level > user.level || user.id === currentUser.id)
        );
    }

    public checkIsAllowedView(currentUser: UserEntity) {
        return checkIsAllowed(currentUser.level, CE_Permission.AccessSite);
    }
}
