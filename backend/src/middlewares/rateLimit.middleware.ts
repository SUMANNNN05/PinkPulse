import rateLimit from "express-rate-limit";

// General API traffic — generous, just stops abusive scripting.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, slow down." },
});

// Auth endpoints — tight, because this is what brute-force login attempts
// and account-enumeration scripts hit first.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many auth attempts, try again later.",
  },
});
