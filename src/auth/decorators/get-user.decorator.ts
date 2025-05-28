import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

export const GetUser = createParamDecorator(
    (data, context: ExecutionContext) =>{
        // console.log(data); //data es lo que viene como parámetro en mi decorador,
                              //idealmente es un arreglo

        const req = context.switchToHttp().getRequest(); //check docs
        const user = req.user;

        if (!user) throw new InternalServerErrorException(`User not found in request`)
            /**
             * es un error 500 y no 400 porque es un error que yo como desarrollador
             * de backend estoy cometiendo. NOta: Este decoradore esta funcionando solo
             * si se está utilizando el GUard con el Token porque el user que aquí se manda se esta
             * atrapando de todo ese proceso de autenticación con el jwt
             */

        // if (data === 'email')
        //     return user.email;
        // return user;

        return (!data) ? user : user[data];
    }
)