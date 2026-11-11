
import { randomUUID } from "node:crypto";

import {
  findByEmailWithPassword,
  findById,
} from "../user/user.repository.js";

import { verifyPassword } from "../../utils/password.js";
import { AppError } from "../../errors/app-error.js";
import type { LoginInput } from "./auth.validation.js";

import {
  createRefreshToken,
  findRefreshTokenByTokenId,
  revokeRefreshTokensBySessionId,
  rotateRefreshToken,
} from "./auth.repository.js";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";

// LOGIN SERVICE
export const loginUser = async (data: LoginInput) => {
  const user = await findByEmailWithPassword(data.email);

  if (!user || !user.passwordHash) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await verifyPassword(
    data.password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const { passwordHash, ...publicUser } = user;

  const accessToken = await generateAccessToken({
    id: publicUser.id,
    role: publicUser.role,
  });

  const sessionId = randomUUID();

  const refreshToken = await generateRefreshToken(publicUser.id);

  await createRefreshToken({
    userId: publicUser.id,
    sessionId,
    tokenId: refreshToken.tokenId,
    expiresAt: refreshToken.expiresAt,
  });

  return {
    user: publicUser,
    accessToken,
    refreshToken: refreshToken.token,
  };
};

// REFRESH TOKEN SERVICE
export const refreshUser = async (token: string) => {
  // 1. Verify the refresh JWT
  let payload;

  try {
    payload = await verifyRefreshToken(token);
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  // 2. Find the corresponding database record
  const storedToken = await findRefreshTokenByTokenId(payload.tokenId);

  if (!storedToken || storedToken.userId !== payload.userId) {
    throw new AppError("Invalid refresh token", 401);
  }

  // 3. Detect reuse of an already-revoked token
  if (storedToken.revokedAt) {
    await revokeRefreshTokensBySessionId(storedToken.sessionId);

    throw new AppError(
      "Refresh token reuse detected. Please log in again.",
      401
    );
  }

  // 4. Check database expiration
  if (storedToken.expiresAt <= new Date()) {
    throw new AppError("Refresh token has expired", 401);
  }

  // 5. Find the user
  const user = await findById(storedToken.userId);

  if (!user) {
    throw new AppError("User no longer exists", 401);
  }

  // 6. Generate a new access token
  const accessToken = await generateAccessToken({
    id: user.id,
    role: user.role,
  });

  // 7. Generate replacement refresh token metadata
  const newRefreshToken = await generateRefreshToken(user.id);

  // 8. Atomically revoke the old token and create the new one
  const rotated = await rotateRefreshToken({
    oldTokenId: payload.tokenId,
    userId: user.id,
    sessionId: storedToken.sessionId,
    newTokenId: newRefreshToken.tokenId,
    expiresAt: newRefreshToken.expiresAt,
  });

  // 9. Handle concurrent reuse or failed rotation
  if (!rotated) {
    await revokeRefreshTokensBySessionId(storedToken.sessionId);

    throw new AppError(
      "Refresh token reuse detected. Please log in again.",
      401
    );
  }

  // 10. Return the replacement tokens
  return {
    accessToken,
    refreshToken: newRefreshToken.token,
  };
};


export const logoutUser = async (token: string | undefined): Promise<void> => {
  // 1. If the cookie is missing, there is nothing to revoke.
  if (!token) return;

  // 2. Verify the refresh token.
  let payload;

  try {
    payload = await verifyRefreshToken(token);
  } catch {
    // Invalid or expired token: logout should still succeed.
    return;
  }

  // 3. Find the token's database record.
  const storedToken = await findRefreshTokenByTokenId(payload.tokenId);

  // 4. If no matching record exists, there is nothing to revoke.
  if (!storedToken || storedToken.userId !== payload.userId) {
    return;
  }

  // 5. Revoke every active refresh token in this session.
  await revokeRefreshTokensBySessionId(storedToken.sessionId);
};
