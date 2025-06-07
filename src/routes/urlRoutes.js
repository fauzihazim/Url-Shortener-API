import express from "express";
import { addUrl, getLongUrl, getUrl } from "../controllers/url.js";
import cors from "cors";

const app = express();
app.use(express.json());
// Enable CORS for all routes
app.use(cors());

// Or configure specific origins
app.use(cors({
  origin: 'http://localhost:3001', // Your Vite frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // If using cookies/auth
}));

// const app = express.Router();
app.get('/:id', getLongUrl);
app.post('/addUrl', addUrl);
app.get('/getUrl/:id', getUrl);

export default app;