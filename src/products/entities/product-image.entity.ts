import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ProductImage {
    //si lo dejo vacío se va autoincrementanto. También podríamos manejar un uuid.
    //La idea es que sea un identificador único de cada iagen que yo voy subiendo
    @PrimaryGeneratedColumn()
    id: number;

    //Así como lo estoy definiendo siempre será requerido el url en la db
    @Column('text')
    url: string;
}

/*
Una vez que yo he creado mi nueva entidad, tengo que decirle a nest 
"oye he creado una nueva entidad", esto se hace en products.module.ts en la parte de TYpeOrmModule
 */