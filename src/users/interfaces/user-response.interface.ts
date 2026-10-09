export interface UserResponse {
  uuid: string;
  username: string;
  email: string;
  person: {
    firstName: string;
    middleName: string | null;
    lastName: string;
  };
}
