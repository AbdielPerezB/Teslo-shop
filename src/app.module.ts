import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
// Para que no me lanze error por el prettier lo desinstalamos:
//yarn remove prettier prettier eslint-config-prettier  eslint-plugin-prettier

@Module({
  imports: [
    ConfigModule.forRoot(), //Para variables de entorno
    TypeOrmModule.forRoot({  //Para postgress
        type: 'postgres',
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT!,
        database: process.env.DB_NAME,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        synchronize: true //Esto es por si cambia una tabla en la db, ejem si se agrega o elimina
                          //una columna, se sincriniza en automático con el app. Usualmente
                          //esto en producción nunca se pone en true, si en producción se hace un 
                          //update de la db, lo que se haría sería una migración
    })
  ],
})
export class AppModule { }
