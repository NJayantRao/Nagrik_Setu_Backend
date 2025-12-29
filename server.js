import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import logger from "./logger.js";
import morgan from "morgan";

/**
 * Load environment variables from .env file
 */
dotenv.config();

import {db} from "./db.js";
import {userRouter} from "./src/routes/userRouter.js";
import {adminRouter} from "./src/routes/adminRouter.js";
import {complaintRouter} from "./src/routes/complaintRouter.js";

/**
 * Initialize Express application
 */
const app = express();

/**
 * ===========================
 * CORS CONFIGURATION
 * ===========================
 * - Allows frontend applications to communicate with backend
 * - Supports credentials (cookies, auth headers)
 * - Restricts allowed origins for security
 */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://nagrik-setu.netlify.app",
      "https://www.nagriksetu.site",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/**
 * Handle preflight OPTIONS requests
 */
app.options(/.*/, cors());

/**
 * Parse incoming JSON requests
 */
app.use(express.json());

/**
 * Server port configuration
 */
const port = process.env.PORT || 3000;

/**
 * ===========================
 * LOGGING CONFIGURATION
 * ===========================
 * Morgan captures HTTP request data
 * Logs are forwarded to custom logger
 */
const morganFormat = ":method :url :status :response-time ms";

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        // Convert log string into structured JSON
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };

        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

/**
 * ===========================
 * HEALTH CHECK / BASE ROUTE
 * ===========================
 */
app.get("/api/v1/", (req, res) => {
  logger.info("Hello World!");
  res.status(200).send("Hello World!");
});

/**
 * ===========================
 * API ROUTES
 * ===========================
 * Route segregation for scalability
 */
app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/complaints", complaintRouter);

/**
 * ===========================
 * START SERVER
 * ===========================
 */
app.listen(port, () => {
  console.log(`Server Running successfully on port ${port}`);
});
