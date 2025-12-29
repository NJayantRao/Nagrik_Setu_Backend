import jwt from "jsonwebtoken";

/**
 * @desc    JWT authentication middleware
 * @access  Private
 *
 * @details
 *  - Verifies the JWT sent in the Authorization header
 *  - Attaches decoded user data to req.user
 *  - Blocks unauthorized or expired tokens
 */
const jwtAuthMiddleware = (req, res, next) => {
  // Extract Authorization header
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send("Token not found...");
  }

  // Extract token from "Bearer <token>"
  const token = authorization.split(" ")[1];
  if (!token) {
    return res.status(401).send("Unauthorized request");
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded payload to request object
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);

    // Handle expired token
    if (error.name === "TokenExpiredError") {
      return res.status(401).send("Token expired. Please login again.");
    }

    // Handle invalid token
    return res.status(401).send("Invalid Token");
  }
};

/**
 * @desc    Generate JWT token
 * @access  Internal
 *
 * @param   {Object} userData - Payload to be signed into the token
 * @returns {String} Signed JWT token
 */
const generateToken = (userData) => {
  return jwt.sign(userData, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export {jwtAuthMiddleware, generateToken};
