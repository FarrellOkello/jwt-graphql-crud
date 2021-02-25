import {Resolver, Query, Mutation,Arg, ObjectType, Field, Ctx, UseMiddleware, Int} from "type-graphql";
import {hash,compare} from "bcryptjs"
import { Entity, getConnection } from "typeorm";
import { User } from "../entity/User";
import { MyContext } from "../MyContext";
import { createAccessToken, createRefreshToken } from "../auth";
import { isAuth } from "../isAuth";
import { Book } from "../entity/Book"



@ObjectType()
class LoginResponse{
    @Field()
    accessToken:string;

    @Field()
    refreshToken:string;

}


@Resolver()
@Entity("users")
export class UserResolver{

    @Query(()=> String)
    hello(){
        return "Hi guy";
    }


    @Query(() => String)    
    bye()    
    {
        return `Your user id is:................`;
    }

    @Query(() => User)
    user(@Arg("id") id: string) {
    return User.findOne({ where: { id } });
    }

    @Query(()=> [User])
    users(){
        return User.find();
    }


    //this is what helps the user to get the refresh tokens reset 
    @Mutation(()=> Boolean)
    async revokeRefreshTokensForUsers(
        @Arg("userId",()=> Int)
        userId:number){
            await getConnection()
            .getRepository(User)
            .increment({id: userId},'tokenVersion',1)
            return true;
        }

    @Mutation(()=>LoginResponse)
        async login(@Arg("email") email:string,
        @Arg("password") password:string,
        @Ctx(){res} : MyContext ):Promise<LoginResponse>{
        const user = await User.findOne({where:{email}});
        if(!user){
            throw new Error("We cant seem to find you in our db!")
        }
        const valid = await compare(password,user.password)
        if (!valid)
        {
            throw new Error("My friend your password failed to match")
        }
            //at successful login we give you an access token 
            //cookie issue is to store the refresh token just know that 
            // res.cookie("jid",createRefreshToken(user),
            // {s
            // httpOnly:true 
            // });         

            // const accessToken = createAccessToken(user);
            // const refreshToken = createRefreshToken(user);
            
            // refreshTokens.push(refreshToken);   

                return {
                    accessToken: createAccessToken(user),
                    refreshToken: createRefreshToken(user),
                    
                }; 
            }

    @Mutation(()=>Boolean)
        async register(@Arg("email") email:string,@Arg("password") password:string,){
            const hashedPassword = await hash(password, 12);
                try{
                await User.insert({
                    email,
                    password:hashedPassword
                });
                }catch(err){
                    throw new Error(" For some reason we aint able to register you!")
                    return false;
                }
                    return true;
        }            
}
