import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { prisma } from "../config/db";
import * as authService from "../services/auth.service";

const REFRESH_COOKIE_NAME = "refreshToken";

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: "strict" as const,
  path: "/api/v1/auth",
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, {
    ...refreshCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  sendSuccess(
    res,
    { user: result.user, accessToken: result.accessToken },
    "Account created",
    201
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, {
    ...refreshCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  sendSuccess(res, { user: result.user, accessToken: result.accessToken }, "Logged in");
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const incomingToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!incomingToken) {
    return res.status(401).json({ success: false, message: "No refresh token provided" });
  }

  const result = await authService.refresh(incomingToken);
  res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, {
    ...refreshCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  sendSuccess(
    res,
    { user: result.user, accessToken: result.accessToken },
    "Token refreshed"
  );
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const incomingToken = req.cookies?.[REFRESH_COOKIE_NAME];
  await authService.logout(incomingToken);
  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
  sendSuccess(res, null, "Logged out");
});

// Protected by requireAuth in the route file — by the time this runs,
// req.user is guaranteed to exist and be valid.
export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  if (!user) throw ApiError.notFound("User not found");
  sendSuccess(res, { user });
});
