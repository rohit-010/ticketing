import express from 'express';
import 'express-async-errors';
import { json } from 'express';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@r0hit-tickets/common';
import { createChargeRouter } from './routes/new';



const app = express();
app.set('trust proxy', true);

app.use(json());
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
}));
app.use(currentUser);
app.use(createChargeRouter);



app.all('*', async() => {
    throw new NotFoundError();
});

app.use(errorHandler);

export {app};