import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).send({ error: "Acceso denegado, no se proporcionó un token." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key") as { _id: string };
    (req as any).userId = decoded._id;
    next();
  } catch (error) {
    res.status(401).send({ error: "Token no válido." });
  }
};
