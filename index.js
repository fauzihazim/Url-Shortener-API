import express from 'express';
const app = express();

import urlRoutes from './src/routes/urlRoutes.js';
app.use(urlRoutes);

app.get('/', (req, res) => {
    res.send('Hello from Node.js server!');
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});