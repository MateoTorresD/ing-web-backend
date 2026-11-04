import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { RoleResponse } from './interfaces/role-response.interface';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectRepository(Role) private readonly rolesRepository: Repository<Role>,
  ) {}

  /** Fixed catalog (3 rows): no pagination needed. */
  async findAll(): Promise<RoleResponse[]> {
    try {
      return await this.rolesRepository.find({
        select: { uuid: true, name: true, description: true },
        order: { name: 'ASC' },
      });
    } catch (error) {
      this.logger.error(
        'Unexpected error while listing roles',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException();
    }
  }
}
