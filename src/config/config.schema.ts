import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsIP,
  IsOptional,
  IsString,
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
}
