import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "../types/auth.types.js";

const JWT_SECRET = process.env.JWT_SECRET as string;

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.access_token;

  if (!token) {
    return res.status(401).json({ message: "No autenticado" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Sesión inválida o expirada" });
  }
}