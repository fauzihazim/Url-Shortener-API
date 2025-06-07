import express from 'express';
import cookieParser from "cookie-parser";
import 'dotenv/config';

import { authGoogle, googleLogin } from '../controllers/auth.js';

const app = express();
app.use(cookieParser());
app.get('/auth/google', authGoogle)
// Callback
app.get("/login/google", googleLogin)

export default app;