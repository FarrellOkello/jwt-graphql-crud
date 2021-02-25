import {User} from "./entity/User";
import  passport = require("passport");
import passportJWT = require("passport-jwt");

export const _passport = ()=>{

let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;

let jwtOptions = {
    jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey : process.env.ACCESS_TOKEN_SECRET
};
// jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
// jwtOptions.secretOrKey = config.jwtconf.jwtSecret;

let strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
    // type user = User;
    const id = { 
        id:jwt_payload.ID

    }
    const userId = User.findOne({where:{id}});
    console.log(userId)
    // let user = queries.getOne('SEC_USERS', 'ID', jwt_payload.ID);
    
    if (userId) {
        next(null, userId);
    } else {
        next(null, false);
    }
});
    passport.use(strategy);
    return passport.initialize();
    
}
// module.exports = passport;