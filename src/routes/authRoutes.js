import express from 'express';
import cookieParser from "cookie-parser";
import 'dotenv/config';
import bodyParser from 'body-parser';
import morgan from 'morgan';

import { askNewToken, authGoogle, googleLogin, login, registerUser, userVerification } from '../controllers/auth.js';
import { logger } from '../middleware/loggerMiddleware.js';
import { dateTimeNow, messageToken, userIdToken } from '../middleware/morganTokens.js';

const app = express();
app.use(logger);
morgan.token('message', messageToken);
morgan.token('userId', userIdToken);
morgan.token("dateTimeNow", dateTimeNow);

app.use(cookieParser());
app.use(bodyParser.json())
app.post("/register", morgan(':status | :url | :message | :userId | :dateTimeNow'), registerUser)
app.get("/verify/:token", morgan(':status | /verify | :message | :userId | :dateTimeNow'), userVerification)
app.post("/login", morgan(':status | :url | :message | :userId | :dateTimeNow'), login)
app.get("/askNewToken", morgan(':status | /askNewToken | :message | :userId | :dateTimeNow'), askNewToken)

app.get('/auth/google', authGoogle)
// Callback
app.get("/login/google", morgan(':status | :url | :message | :userId | :dateTimeNow'), googleLogin)

export default app;