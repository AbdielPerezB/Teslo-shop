import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    ConfigModule,

    TypeOrmModule.forFeature(
      [User]
    ),
    //Para el jwt
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JwtModule.register({
    //   secret: process.env.JWT_SECRET, //Aqupi el problema es que esto se defina antes de que
    //                                   //JWT_SECRET esté definido, por ello utilizaremos la estrategia de abajo
    //   signOptions: {
    //     expiresIn: '2h'
    //   }
    // })

    JwtModule.registerAsync({
      imports: [ConfigModule],//ConfigModule para acceder alas variables de entorno en lugar de utilizar process.env
      inject: [ConfigService], //ConfigService existe en ConfigModule
      useFactory: (configService: ConfigService) => {
        // console.log(process.env.JWT_SECRET)
        // console.log('JWT SECRET:', configService.get('JWT_SECRET'));
        return {
          // secret: process.env.JWT_SECRET,
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '2h'
          }
        }
      }
    })
  ],
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule]
})
export class AuthModule { }

/**
 * En PassportModule.register() también se puede utilizar registerAsync()
 * el async es cuando se requiere registrar un módulo asíncrono. Por si la configuración del servicio
 * requiere de algún servicio externo, otro endpoint, alguna configuración en la nube y requiero
 * esa información antes de cargar
 */