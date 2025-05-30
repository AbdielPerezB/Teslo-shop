import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt'; //Esta también es una manera soft de implementar un poco el patrón adaptador
import { LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly jwtService: JwtService 
        /**
         * JwtMOdule provee el JwtService, esos significa que ya le dice
         * la fecha de expiración, tiempo de duración, llave para firmarlo, etc
         */
    ) { }

    
    async create(createUserDto: CreateUserDto) {
        try {
            const {password, ...userData} = createUserDto;


            const user = this.userRepository.create({
                ...userData,
                password: bcrypt.hashSync(password, 10) //10 vueltas, leer docs pa saber qué es
            });
            await this.userRepository.save(user);
            const{password: pass, ...userInfo} = user;

            return {
                ...userInfo,
                token: this.getJwtToken({id: user.id})
            };
        } catch (error) {
            this.handleDBERrrors(error);
        }

    }

    async login(loginUserDto: LoginUserDto){
        const {password, email} = loginUserDto;

        const user = await this.userRepository.findOne({
            where: {email},
            select: {email: true, password: true, id: true} //Me dice que si regrese el email, pass y id
        });

        if (!user) throw new UnauthorizedException(`Credentials are not valid (email)`)

        if(!bcrypt.compareSync(password, user.password))
            throw new UnauthorizedException(`Credentials are not valid (password)`)
        return {
            ...user,
            token: this.getJwtToken({id: user.id})
        };

    }

    checkAuthService(user: User){
        return {
            ...user,
            token: this.getJwtToken({id: user.id})
        };
    }

    private getJwtToken(payload: JwtPayload){
        const token = this.jwtService.sign(payload);
        return token;
    }

    private handleDBERrrors(error: any): never{
        if(error.code === '23505') throw new BadRequestException(error.detail)

        console.log(error);

        throw new InternalServerErrorException('Please check server logs');
    }
}
