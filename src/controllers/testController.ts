import { Request, Response, NextFunction, response } from "express";
import { request } from "http";

const catchAsync = (fn: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// GET TEST
export const getTest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const message = "THIS IS THE MESSAGE";

    res.status(200).json({
      status: "success",
      message,
    });
  }
);
