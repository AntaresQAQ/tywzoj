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

import { IsPortNumber } from '@/common/validators';

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

class SecurityConfig {
  @ValidateNested()
  @Type(() => CrossOriginSecurityConfig)
  readonly crossOrigin: CrossOriginSecurityConfig;

  @IsString()
  readonly sessionSecret: string;
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
  @ApiProperty()
  readonly discussion: number;

  @IsInt()
  @Min(1)
  @ApiProperty()
  readonly discussionReplies: number;

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
// END

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
}
