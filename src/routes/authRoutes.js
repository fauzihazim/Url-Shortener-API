import express from 'express';
import cookieParser from "cookie-parser";
import 'dotenv/config';
import bodyParser from 'body-parser';
import morgan from 'morgan';

import { askNewToken, authGoogle, googleLogin, login, registerUser, userVerification } from '../controllers/auth.js';
import { logger } from '../middleware/loggerMiddleware.js';
import { messageToken, responseBodyToken, userIdToken } from '../middleware/morganTokens.js';

const app = express();
// app.use((req, res, next) => {
//   const originalJson = res.json;
//   res.json = function (data) {
//     res.body = data; // Store response body for Morgan
//     originalJson.call(this, data);
//   };
//   next();
// });
app.use(logger);
// app.use(cors(corsOptions));

// morgan.token('message', (req, res) => {
//   return res.body?.message || res.body?.error || "";
// });

morgan.token('message', messageToken);

morgan.token('userId', userIdToken);

morgan.token('responseBody', responseBodyToken);

// app.use(morgan(':status | :message'));
app.use(cookieParser());
app.use(bodyParser.json())
app.post("/register", morgan(':status | :url | :message | :userId'), registerUser)
app.get("/verify/:token", morgan(':status | /verify | :message | :userId'), userVerification)
app.post("/login", morgan(':status | :url | :message | :userId'), login)
app.get("/askNewToken", morgan(':status | /askNewToken | :message | :userId'), askNewToken)

app.get('/auth/google', authGoogle)
// Callback
app.get("/login/google", morgan(':status | :url | :message | :userId'), googleLogin)

export default app;