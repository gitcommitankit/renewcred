export const refreshTokenCookieOptions = (env: { NODE_ENV: string }) => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export const accessTokenCookieOptions = (env: { NODE_ENV: string }) => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax' as const,
  maxAge: 15 * 60 * 1000, // 15 minutes
});
