import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import crypto from "crypto";
import { Repository } from "typeorm";

import { CE_Permissions, checkIsAllowed } from "@/common/user-level";

import { UserEntity } from "./user.entity";
import { IUserBaseEntityWithExtra, IUserEntityWithExtra } from "./user.types";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findUserByIdAsync(id: number): Promise<UserEntity> {
    return await this.userRepository.findOne({ id });
  }

  async findUserByUsernameAsync(username: string): Promise<UserEntity> {
    return await this.userRepository.findOne({ username });
  }

  async findUserByEmailAsync(email: string): Promise<UserEntity> {
    return await this.userRepository.findOne({ email });
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

  async updateUserAsync(id: number, user: Partial<UserEntity>) {
    delete user.id;
    return await this.userRepository.update(id, user);
  }
  private static getUserAvatar(user: UserEntity): string {
    const { email = "" } = user;
    return crypto.createHash("md5").update(email.trim().toLowerCase()).digest("hex");
  }

  /**
   * If the current user is ADMIN or self, the email will be returned
   * even if the user set public email to false.
   */
  getUserBaseDetail(user: UserEntity, currentUser: UserEntity): IUserBaseEntityWithExtra {
    const shouldReturnEmail = currentUser.publicEmail || this.checkIsAllowedEdit(user, currentUser);

    return {
      id: user.id,
      username: user.username,
      email: shouldReturnEmail ? user.email : null,
      nickname: user.nickname || undefined,
      level: user.level,
      information: user.information,
      avatar: UserService.getUserAvatar(user),
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
    return (await this.userRepository.count({ username })) === 0;
  }

  async checkEmailAvailabilityAsync(email: string): Promise<boolean> {
    return (await this.userRepository.count({ email })) === 0;
  }

  checkIsAllowedEdit(user: UserEntity, currentUser: UserEntity) {
    return (
      this.checkIsAllowedView(currentUser) && (user.id === currentUser.id || this.checkIsAllowedManage(currentUser))
    );
  }

  checkIsAllowedManage(currentUser: UserEntity) {
    return checkIsAllowed(currentUser.level, CE_Permissions.ManageUser);
  }

  checkIsAllowedView(currentUser: UserEntity) {
    return checkIsAllowed(currentUser.level, CE_Permissions.AccessSite);
  }
}
