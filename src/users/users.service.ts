import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { DataSource, Repository } from 'typeorm';
import { Paginated } from '../common/interfaces/paginated.interface';
import { Person } from '../persons/entities/person.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserResponse } from './interfaces/user-response.interface';

const PG_UNIQUE_VIOLATION = '23505';

const MAX_PAGE_SIZE = 100;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponse> {
    try {
      const passwordHash = await argon2.hash(dto.password);

      return await this.dataSource.transaction(async (manager) => {
        const person = await manager.save(
          manager.create(Person, {
            firstName: dto.firstName.trim(),
            lastName: dto.lastName.trim(),
            middleName: dto.middleName && dto.middleName.trim(),
          }),
        );

        const user = await manager.save(
          manager.create(User, {
            person,
            username: dto.username.trim(),
            email: dto.email.trim().toLowerCase(),
            passwordHash,
          }),
        );

        return this.toResponse(user);
      });
    } catch (error) {
      throw this.toHttpException(error, 'creating user');
    }
  }

  async findAll(page: number, limit: number): Promise<Paginated<UserResponse>> {
    try {
      const safePage = Math.max(page, 1);
      const safeLimit = Math.min(Math.max(limit, 1), MAX_PAGE_SIZE);

      const [users, total] = await this.usersRepository.findAndCount({
        relations: { person: true },
        order: { createdAt: 'DESC' },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
      });

      return {
        data: users.map((user) => this.toResponse(user)),
        meta: {
          page: safePage,
          limit: safeLimit,
          total,
          totalPages: Math.ceil(total / safeLimit),
        },
      };
    } catch (error) {
      throw this.toHttpException(error, 'listing users');
    }
  }

  async findOne(uuid: string): Promise<UserResponse> {
    try {
      const user = await this.usersRepository.findOne({
        where: { uuid },
        relations: { person: true },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return this.toResponse(user);
    } catch (error) {
      throw this.toHttpException(error, 'finding user');
    }
  }

  async update(uuid: string, dto: UpdateUserDto): Promise<UserResponse> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const user = await manager.findOne(User, {
          where: { uuid },
          relations: { person: true },
        });
        if (!user) {
          throw new NotFoundException('User not found');
        }

        if (dto.firstName !== undefined) {
          user.person.firstName = dto.firstName.trim();
        }

        if (dto.middleName !== undefined) {
          user.person.middleName = dto.middleName.trim();
        }

        if (dto.lastName !== undefined) {
          user.person.lastName = dto.lastName.trim();
        }
        if (dto.username !== undefined) {
          user.username = dto.username.trim();
        }
        if (dto.email !== undefined) {
          user.email = dto.email.trim().toLowerCase();
        }

        await manager.save(user.person);
        await manager.save(user);

        return this.toResponse(user);
      });
    } catch (error) {
      throw this.toHttpException(error, 'updating user');
    }
  }

  /** Soft delete: marks deleted_at on User and Person. */
  async remove(uuid: string): Promise<void> {
    try {
      await this.dataSource.transaction(async (manager) => {
        const user = await manager.findOne(User, { where: { uuid } });
        if (!user) {
          throw new NotFoundException('User not found');
        }
        await manager.softDelete(User, { uuid });
        await manager.softDelete(Person, { uuid: user.personUuid });
      });
    } catch (error) {
      throw this.toHttpException(error, 'deleting user');
    }
  }

  private toHttpException(error: unknown, context: string): HttpException {
    if (error instanceof HttpException) {
      return error;
    }

    const { code } = error as {
      code?: string;
    };
    if (code === PG_UNIQUE_VIOLATION) {
      return new ConflictException('Username or email already in use');
    }

    this.logger.error(
      `Unexpected error while ${context}`,
      error instanceof Error ? error.stack : String(error),
    );
    return new InternalServerErrorException();
  }

  private toResponse(user: User): UserResponse {
    return {
      uuid: user.uuid,
      username: user.username,
      email: user.email,
      person: {
        firstName: user.person.firstName,
        middleName: user.person.middleName,
        lastName: user.person.lastName,
      },
    };
  }
}
