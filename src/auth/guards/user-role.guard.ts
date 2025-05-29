import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector
  ){

  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const validRoles: string[] = this.reflector.get('roles', context.getHandler());

    //verificamos que haya validRoles
    if (!validRoles) return true;
    if(validRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    //pequeña validación 
    if(!user) throw new BadRequestException(`User not found`);

    for (const role of user.roles) {
      if (validRoles.includes(role)) return true
    }

    throw new ForbiddenException(`User ${user.fullname} need a valid role: [${validRoles}]`)

  }
}


/**NOTA: Recuerda que los guards estánm dentro del ciclo de vida de nest,
 * es decir, que podemos lanzar exepciones
 * 
 * Reflector: Me ayuda a ver información o metadata de otros decoradores
 * o del mismo método. También es posible que tenga más usos pero hay que ver los docs
 * 
 * validRoles: Aí se obtienen los roles que validaremos para ver si un usuario tiene acceso o no.
 * Se están obteniendo de @SetMetadata('roles',['admin', 'super-user']) o del decorador
 * 
 * context.getHandler(): Es el target de la función get, no estoy seguro qué hace
 * pero hay que ver la documentación para ver
 * 
 * if (!validRoles) return true: Eso significa que si no se obtuvieron los roles validos de 
 * la metadata o de algún lado, eso significa que la validación ya se está haciendo de forma
 * manual en otro lado  y por eso dejo pasar al usuario (retorna true)
 * 
 * if(validRoles.length === 0) return true: Si no hay roles válidos especificados, dejo
 * pasar a todos
 */