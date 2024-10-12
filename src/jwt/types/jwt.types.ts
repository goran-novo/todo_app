export interface JwtPayload {
  email: string;
  sub: number;
}

export interface JwtSignOptions {
  expiresIn: string;
}

export interface LoginResponse {
  access_token: string;
}
