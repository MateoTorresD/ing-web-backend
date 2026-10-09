import { CreateUserDto } from '../../users/dto/create-user.dto';

/** El autoregistro público acepta exactamente los mismos campos que crear un usuario. */
export class RegisterDto extends CreateUserDto {}
