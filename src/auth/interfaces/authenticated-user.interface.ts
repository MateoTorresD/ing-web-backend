import { RoleName } from '../../roles/enums/role-name.enum';

/** User data attached to the request by JwtAuthGuard. */
export interface AuthenticatedUser {
  uuid: string;
  role: RoleName;
}
