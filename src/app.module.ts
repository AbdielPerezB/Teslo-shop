import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { MessageWsModule } from './message-ws/message-ws.module';

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
        // database: 'postgres',
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        autoLoadEntities: true,
        synchronize: true //Esto es por si cambia una tabla en la db, ejem si se agrega o elimina
                          //una columna, se sincriniza en automático con el app. Usualmente
                          //esto en producción nunca se pone en true, si en producción se hace un 
                          //update de la db, lo que se haría sería una migración
    }),
    ProductsModule,
    CommonModule,
    SeedModule,
    FilesModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public')
    }),
    AuthModule,
    MessageWsModule,
  ],
})
export class AppModule {

  // constructor(){
  //   console.log(process.env.DB_HOST)
  //   console.log(process.env.DB_PASSWORD);
  //   console.log(process.env.DB_NAME);
  //   console.log(process.env.DB_PORT);
  //   console.log(process.env.DB_USERNAME);
  // }
 }
