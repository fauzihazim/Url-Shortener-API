// import express from 'express';
// import portfinder from 'portfinder';


// import cors from "cors";

// const app = express();
// app.use(express.json());
// const corsOptions ={
//     origin:'http://localhost:3001', 
//     credentials:true,
//     optionSuccessStatus:200
// }

// import urlRoutes from './src/routes/urlRoutes.js';
// app.use(urlRoutes);

// import authRoutes from "./src/routes/authRoutes.js";
// // import { authenticateAccessToken } from './src/middleware/authMiddleware.js';
// app.use(authRoutes);

// app.get('/', (req, res) => {
//     res.send('Hello from Node.js in port 3000!');
// });

// // const port = 3001;
// // app.listen(port, () => {
// //     console.log(`Server listening on port ${port}`);
// // });

// portfinder.basePort = 3000; // Start checking from port 3000

// portfinder.getPort((err, port) => {
//   if (err) {
//     console.error('Error finding available port:', err);
//     return;
//   }

//   app.listen(port, () => {
//     console.log(`Server running on http://localhost:${port}`);
//   });
// });


import express from 'express';
import cors from 'cors';

// Main app for port 3000
const app3000 = express();
app3000.use(express.json());
app3000.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
  optionSuccessStatus: 200
}));

// Import and use routes for both apps
import urlRoutes from './src/routes/urlRoutes.js';
import authRoutes from './src/routes/authRoutes.js';

app3000.use(urlRoutes);
app3000.use(authRoutes);

app3000.get('/', (req, res) => {
  res.send('Hello from Node.js on port 3000!');
});

// Second app for port 3001
const app3001 = express();
app3001.use(express.json());

app3001.get('/', (req, res) => {
  res.send('Hello from Node.js on port 3001!');
});

// Start both servers
app3000.listen(3000, () => {
  console.log(`Main service running on http://localhost:3000`);
});

app3001.listen(3001, () => {
  console.log(`Secondary service running on http://localhost:3001`);
});