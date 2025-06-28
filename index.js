import express from 'express';
import portfinder from 'portfinder';


import cors from "cors";

const app = express();
app.use(express.json());
const corsOptions ={
    origin:'http://localhost:3001', 
    credentials:true,
    optionSuccessStatus:200
}

import urlRoutes from './src/routes/urlRoutes.js';
app.use(urlRoutes);

import authRoutes from "./src/routes/authRoutes.js";
import { authenticateAccessToken } from './src/middleware/authmiddleware.js';
app.use(authRoutes);

app.get('/', (req, res) => {
    res.send('Hello from Node.js in port 3001!');
});

// const port = 3001;
// app.listen(port, () => {
//     console.log(`Server listening on port ${port}`);
// });

portfinder.basePort = 3000; // Start checking from port 3000

portfinder.getPort((err, port) => {
  if (err) {
    console.error('Error finding available port:', err);
    return;
  }

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});
