// Error Handlers
process.on("uncaughtException", (err) => {
  const msg = `UNCAUGHTEXCEPTION! Shutting down... ${err.name}, ${err.message}.`;
  console.log(msg);
  process.exit(1);
});

// Application code
import app from "./app.js";

const port = 3000;

const server = app.listen(port, () => {
  console.log(`** App running on PORT ${port} **`);
});

// Setup for handling unhandled promise rejections
process.on("unhandledRejection", (err: any) => {
  const msg = `UNHANDLED REJECTION! Shutting down... ${err.name}, ${err.message}.`;
  console.log(msg);
  server.close(() => {
    process.exit(1);
  });
});
