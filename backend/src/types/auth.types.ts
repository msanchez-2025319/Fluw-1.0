export interface JwtPayload {
  id: string;
  role: "ADMIN" | "USER";
  sessionExpiresAt: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}