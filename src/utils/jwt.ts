
import { SignJWT, jwtVerify } from "jose";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
export type UserRole = "USER" | "ADMIN";

// Convert JWT secrets into Uint8Array format
const accessTokenSecret = new TextEncoder().encode(
  env.ACCESS_TOKEN_SECRET
);

const refreshTokenSecret = new TextEncoder().encode(
  env.REFRESH_TOKEN_SECRET
);


// A. Generate Access Token
export const generateAccessToken = async (user: {
  id: string;
  role: UserRole;
}): Promise<string> => {
  const token = await new SignJWT({
    role: user.role,
    tokenType: "access",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(user.id)
    .setExpirationTime(env.ACCESS_TOKEN_EXPIRES_IN)
    .sign(accessTokenSecret);

  return token;
};

const getExpirationDate = (duration: string): Date => {
  const match = duration.match(/^(\d+)([smhd])$/);

  if (!match) {
    throw new Error(`Invalid refresh token expiration: ${duration}`);
  }

  const value = Number(match[1]);
  const unit = match[2];

  const unitInMilliseconds: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return new Date(Date.now() + value * unitInMilliseconds[unit]);
};


// B. Generate Refresh Token

export const generateRefreshToken = async (
  userId: string
): Promise<{
  token: string;
  tokenId: string;
  expiresAt: Date;
}> => {
  const tokenId = randomUUID();

  const expiresAt = getExpirationDate(
    env.REFRESH_TOKEN_EXPIRES_IN
  );

  const token = await new SignJWT({
    tokenType: "refresh",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(userId)
    .setJti(tokenId)
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(refreshTokenSecret);

  return {
    token,
    tokenId,
    expiresAt,
  };
};


export const verifyAccessToken = async (
  token: string
): Promise<{
  userId: string;
  role: UserRole;
}> => {
  const { payload } = await jwtVerify(token, accessTokenSecret, {
    algorithms: ["HS256"],
  });

  if (payload.tokenType !== "access") {
    throw new Error("Invalid token type");
  }

  if (!payload.sub) {
    throw new Error("Token subject is missing");
  }

  if (payload.role !== "USER" && payload.role !== "ADMIN") {
    throw new Error("Invalid user role in token");
  }

  return {
    userId: payload.sub,
    role: payload.role,
  };
};

export const verifyRefreshToken = async (
  token: string
): Promise<{
  userId: string;
  tokenId: string;
}> => {
  const { payload } = await jwtVerify(token, refreshTokenSecret, {
    algorithms: ["HS256"],
  });

  if (payload.tokenType !== "refresh") {
    throw new Error("Invalid token type");
  }

  if (!payload.sub) {
    throw new Error("Token subject is missing");
  }

  if (!payload.jti) {
    throw new Error("Token ID is missing");
  }

  return {
    userId: payload.sub,
    tokenId: payload.jti,
  };
};
