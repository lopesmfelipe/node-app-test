import express from "express";
import cors from "cors";
import morgan from "morgan";
import wRouter from "./routes/wRoutes.js";

const app = express();

// MIDDLEWARES
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// ROUTES
app.use("/whatever", wRouter);

app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

export default app;
