import express from "express";
import { getUrl } from "../controllers/url.js";

const app = express();
app.get('/:id', getUrl);

export default app;