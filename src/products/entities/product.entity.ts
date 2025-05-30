//Esto es lo que va a buacar mi TypeORM para crear mi db

import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "../../auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({name: 'products'}) //El decorador es para que si sea un entity para la db. El name es para renombrar tablas
export class Product {


    @ApiProperty({ //Para la documentación de Swagger
        example: '072cad31-9715-458a-ae91-fdb1606ee809',
        description: 'Product ID',
        uniqueItems: true
    }) 
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'T-Shirt Teslo',
        description: 'Product title',
        uniqueItems: true
    }) 
    @Column('text', { //No todo los tipos de datos dentro del decorador son soportandos por Postgres, algunos son para Mongo u otros tipo de datos de db
        unique: true
    })
    title: string;


    //Si el decorador se dejara vacio, TypeORM intentaría adivinar todos los datos, pero eso no siempre es bueno
    @Column('float', {
        default: 0
    })
    @ApiProperty({
        example: 0,
        description: 'Product price',
    }) 
    price: number;


    //Esta es otra forma de hacer lo mesmo que los atributos de arriba. Hay varias formas de hacer la misma cosa
    @Column({
        type: 'text',
        nullable: true //esto es como decir que es opcional
    })
    @ApiProperty({
        example: 'This is a short description of the product.',
        description: 'Product description',
        default: null
    }) 
    description: string;

    //Para tener url firendlys
    @Column({
        type: 'text',
        unique: true
    })
    @ApiProperty({
        example: 't_shirt_teslo',
        description: 'Product slug - for SEO',
        default: null
    }) 
    slug: string;

    @Column({
        type: 'int',
        default: 0
    })
    @ApiProperty({
        example: 10,
        description: 'Product stock',
        default: 0
    }) 
    stock: number;

    @Column({
        type: 'text',
        array: true //TYpeOrm hace que sea un array solito
    })
    @ApiProperty({
        example: ['M', 'XL', 'XXL'],
        description: 'Product size',
    }) 
    sizes: string[];//  Si muchos datos tendrán este campo en null, SI conviene hacer una tabla, si no, conviene hacerlo así como ahorita, un arregle de str por ejemplo

    @Column('text')
    @ApiProperty({
        example: 'men',
        description: 'Product gender',
    }) 
    gender: string;

    @Column({
        type: 'text',
        array: true,
        default: []
    })
    @ApiProperty()
    tags: string[];

    //Un producto puede tener muchas img
    @OneToMany(
        ()=>ProductImage, //va a regresar un ProductImage
        productImage => productImage.product,
        {
            cascade: true,
            /*
            Esto hace que cuando eliminpo un producto, 
            esto elimina las imagenes que están asociadas al producto.
            Aunque recuerda que esto de eliminar en fuerte de la db solo es para
            este caso didṕactico, en la vida real no es bueno eliminar
            en fuerte cosas de la db con el fin de mantener la integridad de los datos
            y referencias en la db
            */

            eager: true, //Revisar notas del products.service -> findOne()
        }
    )
    @ApiProperty()
    images?: ProductImage[]

    @ManyToOne(
        () => User,
        (user) => user.product,
        {eager: true} //Esto es para que en automático se agregue la relación al crear un nuevo producto.   
                        //También cuando ejecutamos el find, gracias al typeOrm, se muestra la relación en automático
    )
    user: User

    //Se ejecuta siempre antes de hacer una inserción a la db
    @BeforeInsert()
    checkSlogInsert() {
        if (!this.slug) {
            this.slug = this.title
        }
        this.slug = this.slug
            .toLocaleLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
    }

    @BeforeUpdate()
    checkSlugUPdate() {
        //no verificamos que viene el slug porque como es update, siempre hay un sloug
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '');
    }
}
