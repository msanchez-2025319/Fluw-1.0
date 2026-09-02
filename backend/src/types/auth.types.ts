export interface JwtPayload {
  id: string;
  role: "ADMIN" | "USER";
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
export interface JwtPayload {
  id: string;
  role: "ADMIN" | "USER";
  sessionExpiresAt: string;
}