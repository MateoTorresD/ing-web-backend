import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,30}$/;
const USERNAME_MESSAGE =
  'Username must be 3-30 characters: letters, numbers, dot, underscore or hyphen';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  middleName?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @IsString()
  @Matches(USERNAME_REGEX, { message: USERNAME_MESSAGE })
  username: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}
