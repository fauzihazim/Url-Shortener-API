import express from 'express';
import cookieParser from "cookie-parser";
import 'dotenv/config';
import bodyParser from 'body-parser';

import { authGoogle, googleLogin, registerUser } from '../controllers/auth.js';

const app = express();
app.use(cookieParser());
app.use(bodyParser.json())
app.get('/auth/google', authGoogle)
// Callback
app.get("/login/google", googleLogin)
app.post("/register", registerUser)

export default app;