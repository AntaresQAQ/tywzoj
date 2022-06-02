import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsIP,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

import { IsCIDR, IsPortNumber } from '@/common/validators';

import { ConfigRelation, ConfigRelationType } from './config-relation.decorator';

// BEGIN ServerConfig

class ServerConfig {
  @IsIP()
  readonly hostname: string;

  @IsPortNumber()
  readonly port: number;

  @IsArray()
  @IsString({ each: true })
  readonly trustProxy: string[];
}

// END ServerConfig

// BEGIN ServiceConfig

class DatabaseServiceConfig {
  @IsIn(['mysql', 'mariadb'])
  readonly type: 'mysql' | 'mariadb';

  @IsString()
  readonly host: string;

  @IsPortNumber()
  readonly port: number;

  @IsString()
  readonly username: string;

  @IsString()
  readonly password: string;

  @IsString()
  readonly database: string;
}

class MailServiceConfig {
  @IsEmail()
  @IsOptional()
  readonly address: string;

  readonly transport: unknown;
}

class ServiceConfig {
  @ValidateNested()
  @Type(() => DatabaseServiceConfig)
  readonly database: DatabaseServiceConfig;

  @IsString()
  readonly redis: string;

  @ValidateNested()
  @Type(() => MailServiceConfig)
  readonly mail: MailServiceConfig;
}

// END ServiceConfig

// BEGIN SecurityConfig

class CrossOriginSecurityConfig {
  @IsBoolean()
  readonly enabled: boolean;

  @IsArray()
  @IsString({ each: true })
  readonly whiteList: string[];
}

class RecaptchaSecurityConfig {
  @IsString()
  @IsOptional()
  readonly secretKey: string;

  @IsBoolean()
  readonly useRecaptchaNet: boolean;

  @IsString()
  @IsOptional()
  readonly proxyUrl: string;
}

class RateLimitSecurityConfig {
  @IsBoolean()
  readonly enabled: boolean;

  @IsInt()
  @IsOptional()
  readonly maxRequests: number;

  @IsInt()
  @IsOptional()
  readonly durationSeconds: number;

  @IsArray()
  @IsCIDR({ each: true })
  readonly whiteList: string[];
}

class SecurityConfig {
  @ValidateNested()
  @Type(() => CrossOriginSecurityConfig)
  readonly crossOrigin: CrossOriginSecurityConfig;

  @IsString()
  readonly sessionSecret: string;

  @ValidateNested()
  @Type(() => RecaptchaSecurityConfig)
  readonly recaptcha: RecaptchaSecurityConfig;

  @ValidateNested()
  @Type(() => RateLimitSecurityConfig)
  readonly rateLimit: RateLimitSecurityConfig;
}

// END SecurityConfig

// BEGIN ResourceLimitConfig

class ResourceLimitConfig {
  @IsInt()
  @Min(0)
  readonly problemTestdataFiles: number;

  @IsInt()
  @Min(0)
  readonly problemTestdataSize: number;

  @IsInt()
  @Min(0)
  readonly problemAdditionalFileFiles: number;

  @IsInt()
  @Min(0)
  readonly problemAdditionalFileSize: number;

  @IsInt()
  @Min(0)
  readonly problemSamplesToRun: number;

  @IsInt()
  @Min(1)
  readonly problemTestcases: number;

  @IsInt()
  @Min(1)
  readonly problemTimeLimit: number;

  @IsInt()
  @Min(1)
  readonly problemMemoryLimit: number;

  @IsInt()
  @Min(0)
  readonly submissionFileSize: number;
}

// END ResourceLimitConfig

// BEGIN QueryLimitConfig

class QueryLimitConfig {
  @IsInt()
  @Min(1)
  readonly problem: number;

  @IsInt()
  @Min(1)
  readonly problemSet: number;

  @IsInt()
  @Min(1)
  readonly submission: number;

  @IsInt()
  @Min(1)
  readonly submissionStatistic: number;

  @IsInt()
  @Min(1)
  readonly homework: number;

  @IsInt()
  @Min(1)
  readonly contest: number;

  @IsInt()
  @Min(1)
  readonly article: number;

  @IsInt()
  @Min(1)
  readonly articleReply: number;

  @IsInt()
  @Min(1)
  readonly searchUser: number;

  @IsInt()
  @Min(1)
  readonly searchGroup: number;

  @IsInt()
  @Min(1)
  readonly userList: number;
}

// END QueryLimitConfig

// BEGIN PreferenceConfig

// These config items will be sent to client
class SecurityPreferenceConfig {
  @IsBoolean()
  @ApiProperty()
  readonly recaptchaEnabled: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly recaptchaKey: string;

  @IsBoolean()
  @ApiProperty()
  readonly requireEmailVerification: boolean;
}

// These config items will be sent to client
class PaginationPreferenceConfig {
  @IsInt()
  @Min(1)
  @ConfigRelation('queryLimit.article', ConfigRelationType.LessThanOrEqual)
  @ApiProperty({ minimum: 1 })
  readonly homepageNotice: number;

  @IsInt()
  @Min(1)
  @ConfigRelation('queryLimit.userList', ConfigRelationType.LessThanOrEqual)
  @ApiProperty({ minimum: 1 })
  readonly homepageUserList: number;

  @IsInt()
  @Min(1)
  @ConfigRelation('queryLimit.contest', ConfigRelationType.LessThanOrEqual)
  @ApiProperty({ minimum: 1 })
  readonly homepageContest: number;

  @IsInt()
  @Min(1)
  @ConfigRelation('queryLimit.homework', ConfigRelationType.LessThanOrEqual)
  @ApiProperty({ minimum: 1 })
  readonly homepageHomework: number;

  @IsInt()
  @Min(1)
  @ConfigRelation('queryLimit.problem', ConfigRelationType.LessThanOrEqual)
  @ApiProperty({ minimum: 1 })
  readonly problem: number;

  @IsInt()
  @Min(1)
  @ConfigRelation('queryLimit.problemSet', ConfigRelationType.LessThanOrEqual)
  @ApiProperty({ minimum: 1 })
  readonly problemSet: number;

  @IsInt()
  @Min(1)
  @ConfigRelation('queryLimit.submission', ConfigRelationType.LessThanOrEqual)
  @ApiProperty({ minimum: 1 })
  readonly submission: number;

  @IsInt()
  @Min(1)
  @ConfigRelation('queryLimit.submissionStatistic', ConfigRelationType.LessThanOrEqual)
  @ApiProperty({ minimum: 1 })
  readonly submissionStatistic: number;

  @IsInt()
  @Min(1)
  @ConfigRelation('queryLimit.homework', ConfigRelationType.LessThanOrEqual)
  @ApiProperty({ minimum: 1 })
  readonly homework: number;

  @IsInt()
  @Min(1)
  @ConfigRelation('queryLimit.contest', ConfigRelationType.LessThanOrEqual)
  @ApiProperty({ minimum: 1 })
  readonly contest: number;

  @IsInt()
  @Min(1)
  @ConfigRelation('queryLimit.article', ConfigRelationType.LessThanOrEqual)
  @ApiProperty({ minimum: 1 })
  readonly article: number;

  @IsInt()
  @Min(1)
  @ConfigRelation('queryLimit.articleReply', ConfigRelationType.LessThanOrEqual)
  @ApiProperty({ minimum: 1 })
  readonly articleReply: number;

  @IsInt()
  @Min(1)
  @ConfigRelation('queryLimit.userList', ConfigRelationType.LessThanOrEqual)
  @ApiProperty({ minimum: 1 })
  readonly userList: number;
}

// These config items will be sent to client
class MiscPreferenceConfig {
  @IsString()
  @ApiProperty()
  readonly gravatarCdn: string;

  @IsIn(['id', 'rating', 'acceptedProblemCount'])
  @ApiProperty({ enum: ['acceptedProblemCount', 'rating', 'id'] })
  readonly sortUserBy: 'id' | 'rating' | 'acceptedProblemCount';

  @IsBoolean()
  @ApiProperty()
  readonly renderMarkdownInUserBio: boolean;

  @IsBoolean()
  @ApiProperty()
  readonly renderMarkdownInUserListBio: boolean;
}

// These config items will be sent to client
export class PreferenceConfig {
  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly siteName: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly domainIcpRecordInformation: string;

  @ValidateNested()
  @Type(() => SecurityPreferenceConfig)
  @ApiProperty()
  readonly security: SecurityPreferenceConfig;

  @ValidateNested()
  @Type(() => PaginationPreferenceConfig)
  @ApiProperty()
  readonly pagination: PaginationPreferenceConfig;

  @ValidateNested()
  @Type(() => MiscPreferenceConfig)
  @ApiProperty()
  readonly misc: MiscPreferenceConfig;
}

// END PreferenceConfig

export class AppConfig {
  @ValidateNested()
  @Type(() => ServerConfig)
  readonly server: ServerConfig;

  @ValidateNested()
  @Type(() => ServiceConfig)
  readonly service: ServiceConfig;

  @ValidateNested()
  @Type(() => SecurityConfig)
  readonly security: SecurityConfig;

  @ValidateNested()
  @Type(() => ResourceLimitConfig)
  readonly resourceLimit: ResourceLimitConfig;

  @ValidateNested()
  @Type(() => QueryLimitConfig)
  readonly queryLimit: QueryLimitConfig;

  @ValidateNested()
  @Type(() => PreferenceConfig)
  readonly preference: PreferenceConfig;
}
