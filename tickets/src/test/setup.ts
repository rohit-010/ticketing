import request from 'supertest';
import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { app } from '../app';

declare global {
    var signin: () => string[];
}


jest.mock('../nats-wrapper');

let mongo:any
beforeAll(async () => {
    
    process.env.JWT_KEY = 'asdf';
     mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();
   
    await mongoose.connect(mongoUri);
    
   
    //await mongoose.connect(mongoUri);
});



beforeEach(async () => {
    //jest.resetAllMocks();
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections){
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
 });

 global.signin = () => {
   // Build a JWT payload. {email, id}
   const payload = {
       id: new mongoose.Types.ObjectId().toHexString(),
       email: 'test@test.com'
   }

   // Create the JWT!
   const token = jwt.sign(payload, process.env.JWT_KEY!);

   // Build session object. {jwt: MY_JWT}
   const session = {jwt: token};

   // Turn that session object into JSON
   const sessionJSON = JSON.stringify(session);

   // Take JSON and encode it as base64
   const base64 =  Buffer.from(sessionJSON).toString('base64');

   // return a string thats the cookie with encoded data
   return [`session=${base64}`];
 };