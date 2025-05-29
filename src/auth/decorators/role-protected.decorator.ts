import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../interfaces/valid-roles';

//definimos el key en un solo lugar aquí
export const META_ROLES = 'roles';

export const RoleProtected = (...args: ValidRoles[]) => {

    return SetMetadata(META_ROLES, args);
}

/**
 * SetMetadata(META_ROLES, args): Entiendo que esto va por ahí del @SetMetadata('roles',['admin', 'super-user'])
 */
