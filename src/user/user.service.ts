import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import crypto from "crypto";
import { Like, Repository } from "typeorm";

import { CE_Permissions, checkIsAllowed } from "@/common/user-level";

import { UserEntity } from "./user.entity";
import { IUserAtomicEntityWithExtra, IUserBaseEntityWithExtra, IUserEntityWithExtra } from "./user.types";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findUserByIdAsync(id: number): Promise<UserEntity> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findUserByUsernameAsync(username: string): Promise<UserEntity> {
    return await this.userRepository.findOne({ where: { username } });
  }

  async findUserByEmailAsync(email: string): Promise<UserEntity> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findUserListAsync(
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

  async searchUsersByUsernameAsync(keyword: string, take: number): Promise<UserEntity[]> {
    return await this.userRepository.find({ where: { username: Like(`%${keyword}%`) }, take });
  }

  async updateUserAsync(id: number, user: Partial<UserEntity>) {
    delete user.id;
    return await this.userRepository.update(id, user);
  }
  private static getUserAvatar(user: UserEntity): string {
    const email = user.email || "";
    return crypto.createHash("md5").update(email.trim().toLowerCase()).digest("hex");
  }

  getUserAtomicDetail(user: UserEntity): IUserAtomicEntityWithExtra {
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
  getUserBaseDetail(user: UserEntity, currentUser: UserEntity): IUserBaseEntityWithExtra {
    const shouldReturnEmail = user.publicEmail || this.checkIsAllowedEdit(user, currentUser);

    return {
      ...this.getUserAtomicDetail(user),
      email: shouldReturnEmail ? user.email : null,
      nickname: user.nickname,
      level: user.level,
      information: user.information,
    };
  }

  getUserDetail(user: UserEntity, currentUser: UserEntity): IUserEntityWithExtra {
    return {
      ...this.getUserBaseDetail(user, currentUser),
      gender: user.gender,
      rating: user.rating,
      acceptedProblemCount: user.acceptedProblemCount,
      submissionCount: user.submissionCount,
      registrationTime: user.registrationTime,
    };
  }

  async checkUsernameAvailabilityAsync(username: string): Promise<boolean> {
    return (await this.userRepository.count({ where: { username } })) === 0;
  }

  async checkEmailAvailabilityAsync(email: string): Promise<boolean> {
    return (await this.userRepository.count({ where: { email } })) === 0;
  }

  checkIsAllowedEdit(user: UserEntity, currentUser: UserEntity) {
    return (
      this.checkIsAllowedView(currentUser) &&
      (user.id === currentUser.id || this.checkIsAllowedManage(user, currentUser))
    );
  }

  checkIsAllowedManage(user: UserEntity, currentUser: UserEntity) {
    return (
      checkIsAllowed(currentUser.level, CE_Permissions.ManageUser) &&
      (currentUser.level > user.level || user.id === currentUser.id)
    );
  }

  checkIsAllowedView(currentUser: UserEntity) {
    return checkIsAllowed(currentUser.level, CE_Permissions.AccessSite);
  }
}
