import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
// import { RegisterDto } from './dto/register.dto';
import { LoginResponse } from './interfaces/login-response.interface';
// import { UserResponse } from '../users/interfaces/user-response.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Public()
  // @Post('register')
  // register(@Body() dto: RegisterDto): Promise<UserResponse> {
  //   return this.authService.register(dto);
  // }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(dto);
  }
}
