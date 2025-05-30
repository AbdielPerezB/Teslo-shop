import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/interfaces';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}


  @Get()
  // @Auth(ValidRoles.admin)
  executeSeed() {
    return this.seedService.runSeed();
  }

  /**
   * NOTAS DE @Auth(ValidRoles.admin)
   * Yo aquí bien podría utilizar @Auth si no tuviera ninguna dependecia con otros módulos,
   * sin embargo, está utilizando AuthGuard, y ese es un módulo. Por eso me
   * lanza el error de:
   * ERROR [AuthGuard] In order to use "defaultStrategy", please, ensure to import PassportModule in each place where AuthGuard() is being used. Otherwise, passport won't work correctly.
   * Para poder utilizar Auth necesitamos exportar JwtStrategy, PassportModule en los exports de
   * auth.module. E importar AuthModule en el seed.module
   * 
   * Dejamos comentado el Auth porque al ser un seed, se supone que borra
   * todos los usuarios de la db y crea nuevos, por ello habría un conflicto si al ejecutar
   * el seed tendriamos que autenticarnos con un user. Pero deje las notas con findes educativos
   * para que se vea cómo se utiliza el Auth en otros módulos 
   */

}
