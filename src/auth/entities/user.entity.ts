import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('Users')
export class User {
    
    @PrimaryColumn('uuid')
    id: string;

    @Column('text', {unique: true})
    email: string;

    @Column('text')
    password: string;

    @Column('text')
    fullname: string;

    @Column('bool',{default: true, unique: true})
    isActive: boolean;

    @Column('text',{array: true, default: ['user']})
    roles: string[];

}
