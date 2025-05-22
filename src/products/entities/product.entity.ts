//Esto es lo que va a buacar mi TypeORM para crear mi db

import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity() //Para que si sea un entity para la db
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', { //No todo los tipos de datos dentro del decorador son soportandos por Postgres, algunos son para Mongo u otros tipo de datos de db
        unique: true
    })
    title: string;

    //Si el decorador se dejara vacio, TypeORM intentaría adivinar todos los datos, pero eso no siempre es bueno
    @Column('float', {
        default: 0
    })
    price: number;


    //Esta es otra forma de hacer lo mesmo que los atributos de arriba. Hay varias formas de hacer la misma cosa
    @Column({
        type: 'text',
        nullable: true //esto es como decir que es opcional
    })
    description: string;

    //Para tener url firendlys
    @Column({
        type: 'text',
        unique: true
    })
    slug: string;

    @Column({
        type: 'int',
        default: 0
    })
    stock: number;

    @Column({
        type: 'text',
        array: true //TYpeOrm hace que sea un array solito
    })
    sizes: string[];//  Si muchos datos tendrán este campo en null, SI conviene hacer una tabla, si no, conviene hacerlo así como ahorita, un arregle de str por ejemplo

    @Column('text')
    gender: string;

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
