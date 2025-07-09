import express from 'express';
import cors from 'cors';

const app3000 = express();
app3000.use(express.json());
app3000.use(cors({
  origin: 'http://localhost:3002',
  credentials: true,
  optionSuccessStatus: 200
}));

import urlRoutes from './src/routes/urlRoutes.js';
import authRoutes from './src/routes/authRoutes.js';

app3000.use(urlRoutes);
app3000.use(authRoutes);

app3000.get('/', (req, res) => {
  res.send('Hello from Node.js on port 3000!');
});

const app3001 = express();
app3001.use(express.json());
app3001.use(urlRoutes);
app3001.use(authRoutes);

app3001.get('/', (req, res) => {
  res.send('Hello from Node.js on port 3001!');
});

app3000.listen(3000, () => {
  console.log(`Main service running on http://localhost:3000`);
});

app3001.listen(3001, () => {
  console.log(`Secondary service running on http://localhost:3001`);
});