import express from "express";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import wRouter from "./routes/whateverRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import AppError from "./utils/appError.js";
import GlobalErrorHandler from "./controllers/globalErrorHandler.js";

const app = express();

// MIDDLEWARES
// Set Security HTTP headers
app.use(helmet());

// DEVELOPMENT LOGGING
app.use(morgan("dev"));

// LIMIT REQUESTS FROM SAME API
const limiter = rateLimit({
  max: 100, // max 100 requests
  windowMs: 60 * 60 * 1000, // time limit of 1 hour
  message: "Too many requests from this IP, please try again in 1 hour",
});
app.use("/", limiter);

// ALLOW REQUESTS FROM ANY ORIGIN(cross-origin)
app.use(cors());

// BODY PARSER, reading data from body into 'req.body'
app.use(express.json({ limit: "10kb" })); // Limit the body size to 10kb

// DATA SANITIZATION against NoSQL query injection.
// 'mongoSanitize()' Returns a middleware function, this
// middleware then look at the request body, the request
// query string, and request params, and then filter out
// all the dollar signs and and dots, because that's how
// mongoDB operators are written
app.use(mongoSanitize());

// Clean any user input from malicious HTML code
app.use(xss());

// ROUTES
app.use("/whatever", wRouter);
app.use("/user", userRoutes);

// CATCH ALL UNDEFINED ROUTES
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// GLOBAL ERROR HANDLER
app.use(GlobalErrorHandler);

export default app;
