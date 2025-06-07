import express from 'express';
// const app = express();

import cors from "cors";

const app = express();
app.use(express.json());
const corsOptions ={
    origin:'http://localhost:3001', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));

import urlRoutes from './src/routes/urlRoutes.js';
app.use(urlRoutes);

import authRoutes from "./src/routes/authRoutes.js";
app.use(authRoutes);

app.get('/', (req, res) => {
    res.send('Hello from Node.js server!');
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});