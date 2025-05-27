import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt'; //Esta también es una manera soft de implementar un poco el patrón adaptador
import { LoginUserDto } from './dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
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
            return userInfo;
        } catch (error) {
            this.handleDBERrrors(error);
        }

    }

    async login(loginUserDto: LoginUserDto){
        const {password, email} = loginUserDto;

        const user = await this.userRepository.findOne({
            where: {email},
            select: {email: true, password: true}
        });

        if (!user) throw new UnauthorizedException(`Credentials are not valid (email)`)

        if(!bcrypt.compareSync(password, user.password))
            throw new UnauthorizedException(`Credentials are not valid (password)`)
        return user;

    }

    private handleDBERrrors(error: any): never{
        if(error.code === '23505') throw new BadRequestException(error.detail)

        console.log(error);

        throw new InternalServerErrorException('Please check server logs');
    }
}
