import jwt from 'jsonwebtoken';
import 'dotenv/config';

// export const authenticateAccessToken = async (req, res, next) => {
//     try {
//         const accessToken = res.locals.accessToken || getAccessToken(req, res);
//         if (!accessToken) {
//             res.status(401).json({ status: "failed", message: 'Access token is required' });
//             return;
//         };
//         if (await checkBlacklistToken(accessToken, "AccessToken")) {
//             res.status(401).json({ status: "failed", message: 'Access token is blasklisted. Please login again' });
//             return;
//         };
//         // Verify the access token
//         const decodedAccessToken = verifyAccessToken(req, res, accessToken);
//         console.log("Decoded access token ", decodedAccessToken);
//         res.locals.decodedAccessToken = decodedAccessToken; // Attach the decoded user data to the request object
//         next(); // Proceed to the next middleware or route handler
//     } catch (error) {
//         if (error instanceof jwt.TokenExpiredError) {
//             res.status(401).json({ status: "failed", message: 'Access token has expired' });
//         } else if (error instanceof jwt.JsonWebTokenError) {
//             res.status(403).json({ status: "failed", message: 'Invalid access token' });
//         } else {
//             res.status(500).json({ status: "failed", message: 'Internal server error' });
//         }
//     }
// };

export const authenticateAccessToken = (req, res, next) => {
  // Get token from Authorization header
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
    req.user = user; // Attach user data to request
    next(); // Proceed to the next middleware/route handler
  });
};