import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Connection, Repository } from 'typeorm';

import { UserEntity } from '@/user/user.entity';
import { UserService } from '@/user/user.service';

import { AuthEntity } from './auth.entity';
import { RegisterResponseError } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    @InjectRepository(AuthEntity)
    private readonly authRepository: Repository<AuthEntity>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  private static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async findAuthByUserId(userId: number): Promise<AuthEntity> {
    return await this.authRepository.findOne({ userId });
  }

  async checkPassword(auth: AuthEntity, password: string): Promise<boolean> {
    return await bcrypt.compare(password, auth.password);
  }

  async changePassword(auth: AuthEntity, password: string): Promise<void> {
    auth.password = await AuthService.hashPassword(password);
    await this.authRepository.save(auth);
  }

  async register(
    username: string,
    email: string,
    emailVerificationCode: string,
    password: string,
  ): Promise<[error: RegisterResponseError, user: UserEntity]> {
    try {
      let user: UserEntity;
      await this.connection.transaction('READ COMMITTED', async entityManager => {
        user = new UserEntity();
        user.username = username;
        user.email = email;
        user.registrationTime = new Date();
        await entityManager.save(user);

        const auth = new AuthEntity();
        auth.userId = user.id;
        auth.password = await AuthService.hashPassword(password);
        await entityManager.save(auth);
      });
      return [null, user];
    } catch (e) {
      if (!(await this.userService.checkUsernameAvailability(username))) {
        return [RegisterResponseError.DUPLICATE_USERNAME, null];
      }
      if (!(await this.userService.checkEmailAvailability(email))) {
        return [RegisterResponseError.DUPLICATE_EMAIL, null];
      }
      throw e;
    }
  }
}
