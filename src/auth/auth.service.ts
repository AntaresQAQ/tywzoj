import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import bcrypt from "bcrypt";
import { DataSource, Repository } from "typeorm";

import { CE_Permission, checkIsAllowed } from "@/common/user-level";
import { ConfigService } from "@/config/config.service";
import { UserEntity } from "@/user/user.entity";
import { UserService } from "@/user/user.service";
import { UserPreferenceEntity } from "@/user/user-preference.entity";

import { AuthEntity } from "./auth.entity";
import {
    DuplicateEmailException,
    DuplicateUsernameException,
    InvalidEmailVerificationCodeException,
} from "./auth.exception";
import { AuthVerificationCodeService, CE_VerificationCodeType } from "./auth-verification-code.service";

@Injectable()
export class AuthService {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
        @InjectRepository(AuthEntity)
        private readonly authRepository: Repository<AuthEntity>,
        @Inject(forwardRef(() => AuthVerificationCodeService))
        private readonly authVerificationCodeService: AuthVerificationCodeService,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        @Inject(forwardRef(() => ConfigService))
        private readonly configService: ConfigService,
    ) {}

    private static async hashPasswordAsync(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }

    async findAuthByUserIdAsync(userId: number): Promise<AuthEntity> {
        return await this.authRepository.findOne({ where: { userId } });
    }

    async changePasswordAsync(auth: AuthEntity, password: string): Promise<void> {
        auth.password = await AuthService.hashPasswordAsync(password);
        await this.authRepository.save(auth);
    }

    async registerAsync(
        username: string,
        email: string,
        verificationCode: string,
        password: string,
    ): Promise<UserEntity> {
        if (this.configService.config.preference.security.requireEmailVerification) {
            if (
                !(await this.authVerificationCodeService.verifyAsync(
                    CE_VerificationCodeType.Register,
                    email,
                    verificationCode,
                ))
            ) {
                throw new InvalidEmailVerificationCodeException();
            }
        }
        try {
            let user: UserEntity;
            await this.dataSource.transaction("READ COMMITTED", async (entityManager) => {
                user = new UserEntity();
                user.username = username;
                user.email = email;
                user.registrationTime = new Date();
                await entityManager.save(user);

                const auth = new AuthEntity();
                auth.userId = user.id;
                auth.password = await AuthService.hashPasswordAsync(password);
                await entityManager.save(auth);

                const preference = new UserPreferenceEntity();
                preference.userId = user.id;
                await entityManager.save(preference);
            });

            if (this.configService.config.preference.security.requireEmailVerification) {
                await this.authVerificationCodeService.revokeAsync(
                    CE_VerificationCodeType.Register,
                    email,
                    verificationCode,
                );
            }

            return user;
        } catch (e) {
            if (!(await this.userService.checkUsernameAvailabilityAsync(username))) {
                throw new DuplicateUsernameException();
            }
            if (!(await this.userService.checkEmailAvailabilityAsync(email))) throw new DuplicateEmailException();
            throw e;
        }
    }

    async checkPasswordAsync(auth: AuthEntity, password: string): Promise<boolean> {
        return await bcrypt.compare(password, auth.password);
    }

    checkIsAllowedLogin(currentUser: UserEntity) {
        return checkIsAllowed(currentUser.level, CE_Permission.AccessSite);
    }

    checkIsAllowedRegister() {
        // TODO: add a setting in config schema
    }
}
