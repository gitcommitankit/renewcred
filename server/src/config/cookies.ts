import type { CookieOptions } from 'express';

interface CookieEnv {
  NODE_ENV: string;
}

const isProduction = (env: CookieEnv) => env.NODE_ENV === 'production';

export const refreshTokenCookieOptions = (env: CookieEnv): CookieOptions => ({
  httpOnly: true,
  secure: isProduction(env),
  sameSite: isProduction(env) ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

export const accessTokenCookieOptions = (env: CookieEnv): CookieOptions => ({
  httpOnly: true,
  secure: isProduction(env),
  sameSite: isProduction(env) ? 'none' : 'lax',
  maxAge: 15 * 60 * 1000, // 15 minutes
});
