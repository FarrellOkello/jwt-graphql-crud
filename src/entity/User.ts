import { ObjectType ,Int ,Field } from "type-graphql";
import {Entity, PrimaryGeneratedColumn, Column,BaseEntity, Any} from "typeorm";
import { isNumber } from "util";

@ObjectType()
@Entity("users")
export class User extends BaseEntity{

    @Field(()=>Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column("text")
    email: string;

    @Field()
    @Column("text")
    password: string;

    
    @Column("int",{default:0})
    tokenVersion: number;



}
export function getUserById(id: string) {
    return User.findOne(id);
}