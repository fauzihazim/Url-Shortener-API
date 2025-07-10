import jwt from 'jsonwebtoken';
import 'dotenv/config';

export const authenticateAccessToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      status: "failed",
      error: "Access token can't be null"
    });
  };
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        status: "failed",
        error: "Invalid token"
      });
    }
    // req.userId = user.sub;
    res.locals.userId = user.sub;
    next();
  });
};

export const addUrlAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (!err) {
      res.locals.userId = user.sub;
    }
  });
  next();
};