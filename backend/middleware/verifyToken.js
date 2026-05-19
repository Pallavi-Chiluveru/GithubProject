import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

export const verifyToken = (req, res, next) => {
  // support both cookie and Authorization header
  const token =
    req.cookies?.token ||
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "please login" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.KEY);

    // attach user data to request
    req.user = decodedToken;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Session expired : Re-Login",
    });
  }
};