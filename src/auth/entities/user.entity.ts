import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('Users')
export class User {
    
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {unique: true})
    email: string;

    //GRacias el select:false, cuando se haga un find no va a aparecer, a menos que lo especifiquemos. Ver auth.service -> login
    @Column('text',{select: false}) 
    password: string;

    @Column('text')
    fullname: string;

    @Column('bool',{default: true})
    isActive: boolean;

    @Column('text',{array: true, default: ['user']})
    roles: string[];

    @BeforeInsert()
    checkFieldsBeforeInsert(){
        this.email = this.email.toLowerCase().trim()

    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate(){
        this.checkFieldsBeforeInsert()
    }

}
