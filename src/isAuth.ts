import { verify } from "jsonwebtoken"
import { MiddlewareFn } from "type-graphql"
import { MyContext } from "./MyContext"

//the user will send a header with 
//Bearer jkldjjlgjlj
export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
    const authorization = context.auth;
    // console.log(authorization)
    if(!authorization){
        throw new Error("Not authenticated" + authorization)
    }
        try{
            const token = authorization.split(" ")[1]
            console.log(token)
            const payload = verify(token, process.env.ACCESS_TOKEN_SECRET)
            context.payload = payload as any;
        }catch(err)
        {
            console.log(err)
            throw new Error("Not authenticated")
        }
        
    return next()
}