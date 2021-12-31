import { Injectable } from '@nestjs/common';
import fs from 'fs-extra';
import { Redis, ValueType } from 'ioredis';
import * as jwt from 'jsonwebtoken';
import { join } from 'path';

import { ConfigService } from '@/config/config.service';
import { RedisService } from '@/redis/redis.service';
import { UserEntity } from '@/user/user.entity';
import { UserService } from '@/user/user.service';

// Refer to scripts/session-manager.lua for session management details
interface RedisWithSessionManager extends Redis {
  callSessionManager(...args: ValueType[]): Promise<never>;
}

interface SessionInfoInternal {
  loginIp: string;
  userAgent: string;
  loginTime: number;
}

export interface SessionInfo extends SessionInfoInternal {
  sessionId: number;
  lastAccessTime: number;
}

@Injectable()
export class AuthSessionService {
  private redis: RedisWithSessionManager;

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getClient() as RedisWithSessionManager;
    this.redis.defineCommand('callSessionManager', {
      numberOfKeys: 0,
      lua: fs
        .readFileSync(join(__dirname, 'scripts', 'session-manager.lua'))
        .toString('utf-8'),
    });
  }

  async newSession(
    user: UserEntity,
    loginIp: string,
    userAgent: string,
  ): Promise<string> {
    const timeStamp = +new Date();
    const sessionInfo: SessionInfoInternal = {
      loginIp: loginIp,
      userAgent: userAgent,
      loginTime: timeStamp,
    };

    const sessionId = await this.redis.callSessionManager(
      'new',
      timeStamp,
      user.id,
      JSON.stringify(sessionInfo),
    );

    return jwt.sign(
      user.id.toString() + ' ' + sessionId,
      this.configService.config.security.sessionSecret,
    );
  }

  private decodeSessionKey(sessionKey: string): [number, number] {
    const jwtString = jwt.verify(
      sessionKey,
      this.configService.config.security.sessionSecret,
    ) as string;
    return jwtString.split(' ').map(s => parseInt(s)) as [number, number];
  }

  async revokeSession(userId: number, sessionId: number): Promise<void> {
    await this.redis.callSessionManager('revoke', userId, sessionId);
  }

  async revokeAllSessionsExcept(userId: number, sessionId: number): Promise<void> {
    await this.redis.callSessionManager('revoke_all_except', userId, sessionId);
  }

  async endSession(sessionKey: string): Promise<void> {
    try {
      const [userId, sessionId] = this.decodeSessionKey(sessionKey);
      await this.revokeSession(userId, sessionId);
    } catch (e) {}
  }

  async accessSession(sessionKey: string): Promise<[number, UserEntity]> {
    try {
      const [userId, sessionId] = this.decodeSessionKey(sessionKey);

      const success = await this.redis.callSessionManager(
        'access',
        +new Date(),
        userId,
        sessionId,
      );
      if (!success) return [null, null];

      return [sessionId, await this.userService.findUserById(userId)];
    } catch (e) {
      return [null, null];
    }
  }

  async listUserSessions(userId: number): Promise<SessionInfo[]> {
    const result: [string, string, string][] = await this.redis.callSessionManager(
      'list',
      userId,
    );
    return result.map(
      ([sessionId, lastAccessTime, sessionInfo]): SessionInfo => ({
        sessionId: parseInt(sessionId),
        lastAccessTime: parseInt(lastAccessTime),
        ...JSON.parse(sessionInfo),
      }),
    );
  }
}