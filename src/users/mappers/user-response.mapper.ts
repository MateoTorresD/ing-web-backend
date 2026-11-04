import { User } from '../entities/user.entity';
import { UserResponse } from '../interfaces/user-response.interface';

/** Maps a User to its API response. Requires the person and role relations. */
export const toUserResponse = (user: User): UserResponse => ({
  uuid: user.uuid,
  username: user.username,
  email: user.email,
  isActive: user.isActive,
  role: {
    uuid: user.role.uuid,
    name: user.role.name,
  },
  person: {
    firstName: user.person.firstName,
    middleName: user.person.middleName,
    lastName: user.person.lastName,
  },
});
