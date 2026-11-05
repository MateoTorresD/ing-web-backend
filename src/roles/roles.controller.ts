import { Controller, Get } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from './enums/role-name.enum';
import { RoleResponse } from './interfaces/role-response.interface';
import { RolesService } from './roles.service';

@Roles(RoleName.ADMIN)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll(): Promise<RoleResponse[]> {
    return this.rolesService.findAll();
  }
}
