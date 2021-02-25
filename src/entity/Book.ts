import { Field, Int, ObjectType } from "type-graphql";
import {Entity, PrimaryGeneratedColumn, Column,BaseEntity} from "typeorm";

@ObjectType()
@Entity("books")
export class Book extends BaseEntity{
    @Field(()=>Int)
    @PrimaryGeneratedColumn()
    id: number;
    
    @Field()
    @Column("text")
    title: string;

    @Field()
    @Column("text")
    author: string;

    @Field()
    @Column("text")
    isPublished: boolean;

}
