import { Request, Response, NextFunction } from "express";

export const getTest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const message = "THIS IS THE MESSAGE";

  res.status(200).json({
    status: "success",
    message,
  });
};
