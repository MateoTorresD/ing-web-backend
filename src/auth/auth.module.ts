import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from '../persons/entities/person.entity';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { RefreshToken } from './entities/refresh-token.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Person, User, RefreshToken]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.getOrThrow<string>('JWT_ACCESS_SECRET');
        if (secret.length < 32) {
          throw new Error('JWT_ACCESS_SECRET must be at least 32 characters');
        }
        const ttl = Number(config.getOrThrow('JWT_ACCESS_TTL_SECONDS'));
        if (!Number.isInteger(ttl) || ttl <= 0) {
          throw new Error('JWT_ACCESS_TTL_SECONDS must be a positive integer');
        }
        return {
          secret,
          signOptions: { algorithm: 'HS256', expiresIn: ttl },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
  exports: [AuthService],
})
export class AuthModule {}
