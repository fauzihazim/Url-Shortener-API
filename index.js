import express from 'express';
import morgan from 'morgan';
// const app = express();

import cors from "cors";

const app = express();
app.use(express.json());
const corsOptions ={
    origin:'http://localhost:3001', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
// app.use((req, res, next) => {
//   const originalJson = res.json;
//   res.json = function (data) {
//     res.body = data; // Store response body for Morgan
//     originalJson.call(this, data);
//   };
//   next();
// });
// app.use(cors(corsOptions));

// morgan.token('message', (req, res) => {
//   return res.body?.message || res.body?.error || "";
// });

// app.use(morgan(':status | :message'));
// :method :url :status :res[content-length] - :response-time ms

import urlRoutes from './src/routes/urlRoutes.js';
app.use(urlRoutes);

import authRoutes from "./src/routes/authRoutes.js";
import { authenticateAccessToken } from './src/middleware/authmiddleware.js';
app.use(authRoutes);

app.get('/', authenticateAccessToken, (req, res) => {
    res.send('Hello from Node.js server!');
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});