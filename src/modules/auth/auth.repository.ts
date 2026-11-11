
import { prisma } from "../../config/prisma.js";

// 1. Create and store a refresh token
export const createRefreshToken = async (data: {
  userId: string;
  sessionId: string;
  tokenId: string;
  expiresAt: Date;
}) => {
  return prisma.refreshToken.create({
    data: {
      userId: data.userId,
      sessionId: data.sessionId,
      tokenId: data.tokenId,
      expiresAt: data.expiresAt,
    },
  });
};

// 2. Find a refresh token using its unique token ID
export const findRefreshTokenByTokenId = async (tokenId: string) => {
  return prisma.refreshToken.findUnique({
    where: {
      tokenId,
    },
  });
};

// 3. Revoke one refresh token if it has not already been revoked
export const revokeRefreshToken = async (tokenId: string) => {
  return prisma.refreshToken.updateMany({
    where: {
      tokenId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};

// 4. Revoke all active refresh tokens belonging to one session
export const revokeRefreshTokensBySessionId = async (sessionId: string) => {
  return prisma.refreshToken.updateMany({
    where: {
      sessionId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};


export const rotateRefreshToken = async (data: {
  oldTokenId: string;
  userId: string;
  sessionId: string;
  newTokenId: string;
  expiresAt: Date;
}) => {
  return prisma.$transaction(async (tx) => {
    // 1. Revoke the old token only if it is still active
    const result = await tx.refreshToken.updateMany({
      where: {
        tokenId: data.oldTokenId,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        revokedAt: new Date(),
      },
    });

    // 2. If the old token was not revoked, stop
    if (result.count !== 1) {
      return false;
    }

    // 3. Create the replacement refresh token
    await tx.refreshToken.create({
      data: {
        userId: data.userId,
        sessionId: data.sessionId,
        tokenId: data.newTokenId,
        expiresAt: data.expiresAt,
      },
    });

    return true;
  });
};
