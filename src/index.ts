import "reflect-metadata";
import "dotenv/config"
import { createConnection } from "typeorm";
import { buildSchema } from "type-graphql";
import { BookResolver } from "./resolvers/BookResolver";
import { UserResolver } from "./resolvers/UserResolver";
import * as express   from "express";
import * as morgan from 'morgan';
import * as bodyParser from 'body-parser';
import * as errorHandler from 'errorhandler';
import {setupPassportAuth, onlyAuthorized} from "./authenticate"
import { graphql }  from "graphql";
const graphqlHTTP = require('express-graphql').graphqlHTTP;
import { printSchema } from 'graphql';
import * as cors  from "cors";




const DEBUG_MODE = true;
const GRAPHQL_PORT = 4000;


async function main() {
  const conn = await createConnection();
  const schema = await buildSchema({ resolvers: [BookResolver,UserResolver] });

  const app = express();
    // Express morgan logs
  app.use(morgan('combined'));

  // Parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({
      extended: true
  }));

  
  app.use(bodyParser.json())
  // app.use(passport())
  
  
  app.get("/",(_req,res)=>{res.send("hello world!")})

app.use(cors())
  
  // Set Auth
setupPassportAuth(app,DEBUG_MODE);

  app.use('/api',    
        onlyAuthorized(),
        graphqlHTTP(request => {
          const startTime = Date.now();
          return {
              schema: schema,
              graphiql: true,
              extensions({ document, variables, operationName, result }) {
                  return { runTime: Date.now() - startTime };
              }
          };
        }
      ));

      app.use('/schema',
    onlyAuthorized(),
    (req, res, _next) => {
        res.set('Content-Type', 'text/plain');
        res.send(printSchema(schema));
    }
);


  app.use(errorHandler());
  app.listen(4000);
  console.log("Server has started @4000!");
  
}

main();
