import express from "express";
import { addUrl, api, getLongUrl } from "../controllers/url.js";

const app = express();
app.use(express.json())

// const app = express.Router();
app.get('/:id', getLongUrl);
app.post('/addUrl', addUrl);
app.post('/api/data', api);

export default app;