import { RoleName } from '../../roles/enums/role-name.enum';

export interface UserResponse {
  uuid: string;
  username: string;
  email: string;
  isActive: boolean;
  role: {
    uuid: string;
    name: RoleName;
  };
  person: {
    firstName: string;
    middleName: string | null;
    lastName: string;
  };
}
