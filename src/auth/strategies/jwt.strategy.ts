import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";


@Injectable()//Para que sea un provider, también hay que agregarlo en auth.module.ts -> Providers, Exports
export class JwtStrategy extends PassportStrategy(Strategy){

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        configService: ConfigService
    ){
        super({
            secretOrKey: configService.get('JWT_SECRET')!, //de las variables de entorno
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //Se toma de los headers de autenticación cuando se envia la petición 
        })
    }
    /**
     * Cuando llegué un jwt que es vigente en cuanto a la fecha de expiración
     * y también hace match la firma con el payload, entonces se recibe aquí el payload y
     * se valida como yo quiera.
     * 
     * Se recomienda que el payload siempre sea un bjeto, así se le pueden hacer cositas 
     */
    async  validate(payload: JwtPayload):Promise<User>{
        const {id} = payload;
        const user = await this.userRepository.findOneBy({id});
        /**Aquí ya no validamos la pass porque el token se genera despues de ingresar con la contraseña,
         * es decir, aquí se supone que ya envio previamente su email y la pass
         */
        if (!user) throw new UnauthorizedException(`Token not valid`);
        if(!user.isActive) throw new UnauthorizedException(`User is inactive, talk with an admin`)
            //LO de activo es porque es un campo de la db porque así lo diseñamos 


        return user;
        /**Al retornar el user, este en automático se añade a la Request */

    }

}