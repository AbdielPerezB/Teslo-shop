<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Teslo API
1. CLonar proyecto
2. ```yarn install```
3. CLonar el archivo  ```.env.template``` y renombrarlo a ```.env```
4. Cambiar las variables de entorno
5. Levantar la DB
```
docker compose up -d
```
6. Levantar ```yarn start:dev```
7. Ejecutar SEED:
```
http://localhost/api/seed
```

## Stack utilizado
1. Bases de datos en Nest [docs](https://docs.nestjs.com/techniques/database), es posible utilizar TypeORM o PRISMA
2. Para utilizar Variables de entorno: `yarn add @nestjs/config`
3. Postgres `yarn add @nestjs/typeorm typeorm pg`
4. Class validator y class transformer ```yarn add class-validator class-transformer```
5. UUID: `yarn add uuid` y `yarn add @types/uuid`
6. [Query Runner](https://orkhan.gitbook.io/typeorm/docs/insert-query-builder)
7. [FileUpload](https://docs.nestjs.com/techniques/file-upload) ```$ npm i -D @types/multer```. Esto no sería necesario si estuvieramos utilizando nest con JavaScript, pero como estamos utilizando TypeScript es necesario instalar los tipos. El -D se aplica siempre que instalamos archivos de definición para TypeScript
8. ServeStaticModule -> Esto para cuando queramos poner las imagenes en una carpeta pública ```yarn add @nestjs/serve-static```
9. bcrypt ```yarn add bcrypt``` y para instalar los tipos de typescript (solo para desarrollo): ```yarn add -D @types/bcrypt```
10. [Authentication](https://docs.nestjs.com/security/authentication) ```yarn add @nestjs/jwt passport-jwt``` ```yarn add -D @types/passport-jwt```
11. [Passport](https://docs.nestjs.com/recipes/passport) ```yarn add @nestjs/passport passport```
12. Página para revisar los tokens: [jwt.io](jwt.io)