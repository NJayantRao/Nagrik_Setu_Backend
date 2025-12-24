import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import logger from "./logger.js";
import morgan from "morgan";

dotenv.config();
import {db} from "./db.js";
import {userRouter} from "./src/routes/userRouter.js";
import {adminRouter} from "./src/routes/adminRouter.js";
import {complaintRouter} from "./src/routes/complaintRouter.js";

const app = express();

//cors configurations
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

app.options(/.*/, cors());

app.use(express.json());
const port = process.env.PORT || 3000;

const morganFormat = ":method :url :status :response-time ms";

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
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

app.get("/api/v1/", (req, res) => {
  logger.info("Hello World!");
  res.status(200).send("Hello World!");
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/complaints", complaintRouter);

app.listen(port, () => {
  console.log(`Server Running successfully on port ${port}`);
});
