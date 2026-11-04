import { Controller, Get } from '@nestjs/common';
import { RoleResponse } from './interfaces/role-response.interface';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll(): Promise<RoleResponse[]> {
    return this.rolesService.findAll();
  }
}
