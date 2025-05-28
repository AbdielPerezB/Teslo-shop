import { Controller, Post, Body, Get, UseGuards, Req, Headers} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { RawHeaders } from './decorators/raw-headers.decorator';
import { IncomingHttpHeaders } from 'http';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  /**Ya nomas con esto del UseGuards AuthGuard, en automático toma todas
   * las configuraciones de nuestra estrategia
   */
  @UseGuards(AuthGuard())
  testingPrivateROute(
    // @Req() request: Express.Request //request de http de express
    @GetUser() user: User, //decorador propio creado para obtener el user del token
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders
  ){
    // console.log(request);
    return {
      ok: true,
      message: 'Hola mundo private',
      user,
      email: userEmail,
      rawHeaders,
      headers
    }
  }
}
