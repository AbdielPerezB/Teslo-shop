import { Controller, Post, Body, Get, UseGuards, Req, Headers, SetMetadata} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { RawHeaders } from './decorators/raw-headers.decorator';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces';

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

  @Get('private2')
  // @SetMetadata('roles',['admin', 'super-user'])
  @RoleProtected(ValidRoles.superUser, ValidRoles.user)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRouter2(
    @GetUser() user: User
  ){
    return {
      ok: true,
      user
    }

  }
}

  /**NOTAS DEL private2
   * Este endpoint es solo para fines educativos.
   * Lo que hace es utilizar un custon guard y custom decorator
   * para verficar si el usuario cuentoa con los roles :['admin', etc] para acceder
   * y si no pues no lo deja pasar.
   * 
   * Para que funcione se necesitan los archivos de:
   *    guards/user-role.guard.ts
   *    decorators/role-protected.decorator.ts
   *    interfaces/valid-roles.ts
   * 
   * 
   * @RoleProtected(ValidRoles.superUser, ValidRoles.user):
   * Como ahora hicimos un decorador personalizado para setear el metadata de los roles
   * de los usuarios permitidos ya no necesitamos @SetMetadata('roles',['admin', 'super-user']).
   * Dentro de @RoleProtected podemos colocar todos los roles de usuario que queremos permitir
   * 
   * En este momento no tenemos composición de decoradores, por lo tanto:
   * AuthGuard() es para autenticar
   * UserRoleGuard es para autorizar
   */
