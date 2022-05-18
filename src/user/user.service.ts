import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import crypto from 'crypto';
import { Repository } from 'typeorm';

import { UserEntity } from '@/user/user.entity';

import { UserMetaDto } from './dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findUserById(id: number): Promise<UserEntity> {
    return await this.userRepository.findOne({ id });
  }

  async findUserByUsername(username: string): Promise<UserEntity> {
    return await this.userRepository.findOne({ username });
  }

  async findUserByEmail(email: string): Promise<UserEntity> {
    return await this.userRepository.findOne({ email });
  }

  private static getUserAvatar(user: UserEntity): string {
    return crypto.createHash('md5').update(user.email.trim().toLowerCase()).digest('hex');
  }

  /**
   * If the current user is ADMIN, MANAGER or self, the email will be returned
   * even if the user set public email to false.
   */
  async getUserMeta(user: UserEntity, currentUser: UserEntity): Promise<UserMetaDto> {
    const returnEmail: boolean =
      currentUser.publicEmail || user.id === currentUser.id || currentUser.isManager;
    return {
      id: user.id,
      username: user.username,
      email: returnEmail ? user.email : null,
      nickname: user.nickname,
      gender: user.gender,
      avatar: UserService.getUserAvatar(user),
      type: user.type,
      rating: user.rating,
      acceptedProblemCount: user.acceptedProblemCount,
      submissionCount: user.submissionCount,
      information: user.information,
      registrationTime: user.registrationTime,
    };
  }

  async checkUsernameAvailability(username: string): Promise<boolean> {
    return (await this.userRepository.count({ username })) === 0;
  }

  async checkEmailAvailability(email: string): Promise<boolean> {
    return (await this.userRepository.count({ email })) === 0;
  }

  async getUserList(
    sortBy: 'acceptedProblemCount' | 'rating' | 'id',
    skipCount: number,
    takeCount: number,
  ): Promise<[users: UserEntity[], count: number]> {
    return await this.userRepository.findAndCount({
      order: {
        [sortBy]: sortBy === 'id' ? 'ACS' : 'DESC',
      },
      skip: skipCount,
      take: takeCount,
    });
  }
}
