import express from 'express';
import cookieParser from "cookie-parser";
import 'dotenv/config';
import bodyParser from 'body-parser';

import { askNewToken, authGoogle, googleLogin, login, registerUser, userVerification } from '../controllers/auth.js';

const app = express();
app.use(cookieParser());
app.use(bodyParser.json())
app.post("/register", registerUser)
app.get("/verify/:token", userVerification)
app.post("/login", login)
app.get("/askNewToken", askNewToken)

app.get('/auth/google', authGoogle)
// Callback
app.get("/login/google", googleLogin)

export default app;