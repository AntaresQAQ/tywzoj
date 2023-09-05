import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthModule } from "@/auth/auth.module";

import { UserController } from "./user.controller";
import { UserEntity } from "./user.entity";
import { UserService } from "./user.service";
import { UserPreferenceEntity } from "./user-preference.entity";
import { UserProblemMapEntity } from "./user-problem-map.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
        TypeOrmModule.forFeature([UserPreferenceEntity]),
        TypeOrmModule.forFeature([UserProblemMapEntity]),
        forwardRef(() => AuthModule),
    ],
    exports: [UserService],
    providers: [UserService],
    controllers: [UserController],
})
export class UserModule {}
