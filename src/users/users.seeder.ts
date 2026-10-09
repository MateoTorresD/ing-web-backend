import {
  ConflictException,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

/**
 * Creates the initial user based on the SEED_* env variables
 * when user count === 0
 */
@Injectable()
export class UsersSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersSeeder.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if ((await this.usersRepository.count()) > 0) {
      this.logger.debug('Skipping initial user creation...');
      return;
    }

    const dto = plainToInstance(CreateUserDto, {
      firstName: this.config.get<string>('SEED_FIRST_NAME'),
      middleName: this.config.get<string>('SEED_MIDDLE_NAME') || undefined,
      lastName: this.config.get<string>('SEED_LAST_NAME'),
      username: this.config.get<string>('SEED_USERNAME'),
      email: this.config.get<string>('SEED_EMAIL'),
      password: this.config.get<string>('SEED_PASSWORD'),
    });

    const errors = await validate(dto);
    if (errors.length > 0) {
      const details = errors
        .flatMap((error) => Object.values(error.constraints ?? {}))
        .join('; ');
      this.logger.warn(
        `No users found and the SEED_* variables are missing or invalid, skipping the initial user: ${details}`,
      );
      return;
    }

    try {
      const user = await this.usersService.create(dto);
      this.logger.debug(`Initial user "${user.username}" created`);
    } catch (error) {
      if (error instanceof ConflictException) {
        return;
      }
      throw error;
    }
  }
}
