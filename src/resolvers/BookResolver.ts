import { Resolver, Query, Mutation, Arg } from "type-graphql";
import { Book } from "../entity/Book";
import { Entity, ViewEntity } from "typeorm";


@Resolver()
@ViewEntity({})
@Entity("books")
export class BookResolver{
  @Query(() => [Book])
  books() {
    return Book.find();
  }

  @Query(() => Book)
  book(@Arg("id") id: string) {
    return Book.findOne({ where: { id } });
  }

  @Mutation(() => Book)
  async createBook(@Arg("title") title:string,@Arg("author") author:string,@Arg("isPublished") isPublished:boolean) { 
    
    let book : any;
    try{
      const _book = Book.create({title,author,isPublished})
      book = await _book.save();      
      }catch(err){
          throw new Error("For some reason we aint able to register your book!")
          return false;
      }
          console.log(book);
          return book;
  }

  @Mutation(() => Book)
  async updateBook(@Arg("id") id: string,@Arg("title") title:string,@Arg("author") author:string,@Arg("isPublished") isPublished:boolean) { 
    const book = await Book.findOne({ where: { id } });
    if (!book) throw new Error("Book not found!");
    Object.assign(book,{title,author,isPublished});
    await book.save();
    return book;
  }

  @Mutation(() => Boolean)
  async deleteBook(@Arg("id") id: string) {
    const book = await Book.findOne({ where: { id } });
    if (!book) throw new Error("Book not found!");
    await book.remove();
    return true;
  }
}
