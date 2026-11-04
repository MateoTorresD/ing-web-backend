export interface UserResponse {
  uuid: string;
  username: string;
  email: string;
  isActive: boolean;
  person: {
    firstName: string;
    middleName: string | null;
    lastName: string;
  };
}
