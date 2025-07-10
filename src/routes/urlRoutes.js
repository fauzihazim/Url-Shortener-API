import express from "express";
import { addUrl, analyticsUrl, getLongUrl, getUrl } from "../controllers/url.js";
import cors from "cors";
import morgan from 'morgan';
import { authenticateAccessToken } from "../middleware/authMiddleware.js";
import { logger } from "../middleware/loggerMiddleware.js";
import { dateTimeNow, messageToken, userIdToken } from "../middleware/morganTokens.js";
import { addUrlAuth } from "../middleware/authMiddleware.js";
import { accessLogStream } from "../utils/loggerUtils.js";

const app = express();
app.use(express.json());
app.use(cors());
app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(logger);
morgan.token('message', messageToken);
morgan.token('userId', userIdToken);
morgan.token("dateTimeNow", dateTimeNow);

app.get('/d/:id', getLongUrl);
app.get('/analytics/:id', authenticateAccessToken, analyticsUrl);
app.post('/addUrl', morgan(':status | :url | :message | :userId | :dateTimeNow', { stream: accessLogStream }), addUrlAuth, addUrl);
app.get('/getUrl/:id', getUrl);

export default app;