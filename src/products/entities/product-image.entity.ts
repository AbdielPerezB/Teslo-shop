import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity()
export class ProductImage {
    //si lo dejo vacío se va autoincrementanto. También podríamos manejar un uuid.
    //La idea es que sea un identificador único de cada iagen que yo voy subiendo
    @PrimaryGeneratedColumn()
    id: number;

    //Así como lo estoy definiendo siempre será requerido el url en la db
    @Column('text')
    url: string;

    @ManyToOne(
        ()=>Product,
        (product) => product.images,
        {onDelete: 'CASCADE'} //Así se elimina en casacada. Ver
                            // product.service en remove par aver el contexto
    )
    product: Product
    /*
    Esto no es una columna en ls db (@Column()), sino que es
    una relación, un montón de imagenes pueden tener un
    único producto.
    Muchos registros de mi tabla image pueden tener un único, uno o más producto
    */
}

/*
Una vez que yo he creado mi nueva entidad, tengo que decirle a nest 
"oye he creado una nueva entidad", esto se hace en products.module.ts en la parte de TYpeOrmModule
 */