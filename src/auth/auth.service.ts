import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserResponse } from '../users/interfaces/user-response.interface';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginResponse } from './interfaces/login-response.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  register(dto: RegisterDto): Promise<UserResponse> {
    return this.usersService.create(dto);
  }

  async login(dto: LoginDto): Promise<LoginResponse> {
    try {
      const identifier = dto.identifier.trim();

      const user = await this.usersRepository.findOne({
        where: [{ username: identifier }, { email: identifier }],
        relations: { person: true },
        select: {
          uuid: true,
          username: true,
          email: true,
          passwordHash: true,
          person: { firstName: true, middleName: true, lastName: true },
        },
      });

      const passwordMatches =
        !!user && (await argon2.verify(user.passwordHash, dto.password));

      if (!user || !passwordMatches) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const accessToken = await this.jwtService.signAsync({ sub: user.uuid });

      return {
        accessToken,
        user: {
          uuid: user.uuid,
          username: user.username,
          email: user.email,
          person: {
            firstName: user.person.firstName,
            middleName: user.person.middleName,
            lastName: user.person.lastName,
          },
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        'Unexpected error during login',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException();
    }
  }
}
