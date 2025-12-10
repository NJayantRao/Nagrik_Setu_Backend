import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;

db.on("connected", () => {
  console.log("Mongo DB Server connected successfully...");
});

db.on("error", () => {
  console.log("Error in connecting Mongo DB Server...");
});

db.on("disconnected", () => {
  console.log("Mongo DB Server disconnectd...");
});

export { db };
