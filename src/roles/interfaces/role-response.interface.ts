import { RoleName } from '../enums/role-name.enum';

export interface RoleResponse {
  uuid: string;
  name: RoleName;
  description: string;
}
