import mongoose from "mongoose";
import app from "./app.js";
import dotenv from "dotenv";

// Error Handler
process.on("uncaughtException", (err) => {
  const msg = `UNCAUGHTEXCEPTION📢! Shutting down... ${err.name}, ${err.message}.`;
  console.log(msg);
  process.exit(1);
});

// Application code

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE;
const PORT = process.env.PORT || 3000;

if (!DB) {
  throw new Error(
    "Database connection string is not defined in environment variables."
  );
}

// Connect to database
mongoose.connect(DB).then(() => console.log("DB CONNECTED SUCCESSFULLY"));

// Start server
const server = app.listen(PORT, () => {
  console.log(`** App running on PORT ${PORT} **`);
});

// handling unhandled promise rejections
process.on("unhandledRejection", (err: any) => {
  console.log(`UNHANDLED REJECTION📢! Shutting down. ${err.name}, ${err.message}.`);
  server.close(() => {
    process.exit(1);
  });
});
