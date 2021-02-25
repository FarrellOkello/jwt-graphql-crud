import * as passport from 'passport';
import * as jwt from 'jsonwebtoken';
import {/* hash, */compare} from "bcryptjs"
import { Application, Request/* , Response, RequestHandler, response */ } from 'express';
import { Strategy, StrategyOptions, ExtractJwt, VerifiedCallback } from 'passport-jwt';
import { User ,getUserById } from "./entity/User";
import { verify } from 'jsonwebtoken';
import { createAccessToken, createRefreshToken } from './auth';



interface JwtPayload {
    userId: string;
    tokenVersion: number;
}

const JWT_SECRET_KEY = process.env.REFRESH_TOKEN_SECRET;

/** Options for JWT
 * in this exemple we use fromAuthHeader, so the client need to
 * provide an "Authorization" request header token
 */

const jwtOptions: StrategyOptions = {
    jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.ACCESS_TOKEN_SECRET,
    passReqToCallback: true,
};

const jwtStategy = new Strategy(jwtOptions,(req: Request, jwtPayload: JwtPayload, done: VerifiedCallback) => {
        
        // In the login we encrypt the payload

        if (!jwtPayload.userId) {
            throw new Error('No userId in the JWT session token');
            
        }
        // console.log(jwtPayload.userId)
        getUserById(jwtPayload.userId)
            .then((user) => {
                // console.log(user)
                if (user) {
                    return done(null, user);                   
                } else {
                    return done(null, false);
                    // TODO: handle custom error to ask for create a new account
                }
            }).catch(err => {
                
                return done(err, false);
            });
    });

/**
 * If added to a express route, it will make the route require the auth token
 */
export function onlyAuthorized() {
    return passport.authenticate('jwt', { session: false });
}

/**
 * Setup the Passport JWT for the given express App.
 * It will add the auth routes (auth, login, logout) to handle the token authorization
 * It will use the mongoDB UserModel to check for user and password
 * Set addDebugRoutes to true for adding a Auth Form for testing purpose
 */
export function setupPassportAuth(app: Application, addDebugRoutes = false) {

    passport.use(jwtStategy);
    // console.log(jwtStategy)
    app.use(passport.initialize());
    // console.log("passport has now initialized we go and compare tokens")
    if (addDebugRoutes) {

        app.get('/auth', (req, res) => {
            const loginFormHtml = `
            <form action="/login" method="post">
                <div>
                    <label>Username:</label>
                    <input type="text" name="username"/>
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" name="password"/>
                </div>
                <div>
                    <input type="submit" value="Log In"/>
                </div>
            </form>
        `;
            res.send(loginFormHtml);
        });

    }

    app.post('/login', async (req, res, next) => {
        try {
            const { email, password } = req.body;
            
            if (!email || !password) {
                throw new Error('email or password not set in the request');
            }

            // Get user by email
            const user = await  User.findOne({where:{email}});
            // console.log(user)

            if (!user) {
                throw new Error(`User for ${email} could not be found`);
            }

            // Check user password using custom method in jwt 
            const valid = await compare(password,user.password)
            if (!valid)
            {
                throw new Error("Your password failed to match")
            }
            // console.log(valid)       
            // const jwtPayload: JwtPayload = {
            //     userId: user.id.toString(),
            //     tokenVersion: user.tokenVersion
            // };
            // res.send({message:"Login successful!"})
           
            const token = createAccessToken(user);             
            console.log("ACCESS TOKEN"+token)
            // res.json({token})

                        
            const refresh_token = createRefreshToken(user);
            console.log(" REFRESH TOKEN "+refresh_token)
            res.json({token,refresh_token}) 

        } catch (error) {
            res.json({
                error: error.message                
            }); 
            
        }
    });


    //i personally added this to it for the refresh token function
    app.post("/refresh_token", async (req , res)=>{
        console.log(req.headers.authorization);
        const token = req.headers.authorization.split(' ')[1];
        // console.log(process.env.REFRESH_TOKEN_SECRET!);
        if(!token){
            return res.send({ok: false, accessToken:"",message:'The token is not valid 1st'}) 
        }

        let payload : any = null;
        try {
            payload = verify(token, process.env.REFRESH_TOKEN_SECRET!) 
            // payload ="";
        }catch(err){
            console.log(err)
            return res.send({ok: false, accessToken:""})            
        }
        //when we reach here we know that the token is valid and we can send back an access token got it!
        const user = await User.findOne({id:payload.userId})//

        if(!user){
            return res.send({ok: false, accessToken:""}) 
        }

        //helps when you are revoking a password
        if(user.tokenVersion !== payload.tokenVersion){
            return res.send({ok: false, accessToken:""}) 
        }
        const accessToken = createAccessToken(user);
        const fresToken = createRefreshToken(user);
        return res.json({ok: true , accessToken: accessToken, refreshToken:fresToken }) 
        
    }); 


    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });
}
