import { SetMetadata, UseGuards } from '@nestjs/common';
import { applyDecorators } from '@nestjs/common';
import { ValidRoles } from '../interfaces';
import { RoleProtected } from './role-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role.guard';


export function Auth(...roles: ValidRoles[]) {
    return applyDecorators(

        RoleProtected(...roles),
        // SetMetadata('roles', roles),
        UseGuards(AuthGuard(), UserRoleGuard),
    );
}

/**
 * En lugar de utilizar SetMetadata('roles', roles), utilizamos nuestro
 * propio decorador que ya tenemos creado, el de RoleProtected(ValidRoles.superUser, ValidRoles.admin)
 * 
 * 
 * En realidad lo que hicimos fue mover todo esto:
 * @RoleProtected(ValidRoles.superUser, ValidRoles.user)
 * @UseGuards(AuthGuard(), UserRoleGuard)
 * del auth.controller
 * a un solo applyDecorators
 */