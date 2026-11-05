import { SetMetadata } from '@nestjs/common';
import { RoleName } from '../../roles/enums/role-name.enum';

export const ROLES_KEY = 'roles';

/** Restricts a controller or route to the given roles (checked by RolesGuard). */
export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);
