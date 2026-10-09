import { UserResponse } from '../../users/interfaces/user-response.interface';

export interface LoginResponse {
  accessToken: string;
  user: UserResponse;
}
