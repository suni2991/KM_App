const jwt = require("jsonwebtoken");

require("dotenv").config({ path: "../" });
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const authenticate = async (req, res, next) => {
  // const token = req.header('Authorization').replace('Bearer ', '');
  const authorizationHeader = req.header("Authorization");

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied" });
  }

  const bearerToken = authorizationHeader.split(" ")[1];

  if (!bearerToken) {
    return res.status(401).json({ message: "Access denied" });
  }
  try {
    const decoded = jwt.verify(bearerToken, JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token", error: error.message });
  }
};

module.exports = { authenticate };
