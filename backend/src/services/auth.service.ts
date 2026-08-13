import bcrypt from "bcrypt";
import { prisma } from "../config/db";
import { ApiError } from "../utils/ApiError";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  getExpiryDate,
} from "../utils/token.util";
import { env } from "../config/env";
import type { RegisterInput, LoginInput } from "../validators/auth.validator";

const SALT_ROUNDS = 12;

interface AuthResult {
  user: { id: string; name: string; email: string; role: string };
  accessToken: string;
  refreshToken: string;
}

async function issueTokenPair(user: {
  id: string;
  email: string;
  role: "CLINICIAN" | "ADMIN";
}) {
  const accessToken = signAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });
  const refreshToken = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: getExpiryDate(env.jwt.refreshExpiresIn),
    },
  });

  return { accessToken, refreshToken };
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash },
  });

  const { accessToken, refreshToken } = await issueTokenPair(user);

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user) throw ApiError.unauthorized("Invalid email or password");

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) throw ApiError.unauthorized("Invalid email or password");

  const { accessToken, refreshToken } = await issueTokenPair(user);

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
}

export async function refresh(rawRefreshToken: string): Promise<AuthResult> {
  let decoded: { id: string };
  try {
    decoded = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const tokenHash = hashToken(rawRefreshToken);
  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
  });

  if (
    !storedToken ||
    storedToken.revoked ||
    storedToken.expiresAt < new Date() ||
    storedToken.userId !== decoded.id
  ) {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) throw ApiError.unauthorized("Invalid or expired refresh token");

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revoked: true },
  });

  const { accessToken, refreshToken: newRefreshToken } = await issueTokenPair(user);

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken: newRefreshToken,
  };
}

export async function logout(rawRefreshToken: string | undefined): Promise<void> {
  if (!rawRefreshToken) return;

  const tokenHash = hashToken(rawRefreshToken);
  await prisma.refreshToken
    .updateMany({
      where: { tokenHash },
      data: { revoked: true },
    })
    .catch(() => undefined);
}
