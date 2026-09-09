export const sessionCookieName = "cms_session";
export const sanctumTokenLifetimeSeconds = 60 * 60 * 24;

export type SessionCookieOptions = {
  httpOnly: true;
  maxAge?: number;
  path: "/";
  sameSite: "lax";
  secure: boolean;
};

export function createSessionCookieOptions(
  isProduction: boolean,
  maxAgeSeconds: number = sanctumTokenLifetimeSeconds,
): SessionCookieOptions {
  const options: SessionCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
  };

  if (maxAgeSeconds !== undefined) {
    options.maxAge = maxAgeSeconds;
  }

  return options;
}

export function createSessionCookieClearOptions(
  isProduction: boolean,
): SessionCookieOptions {
  return {
    ...createSessionCookieOptions(isProduction),
    maxAge: 0,
  };
}
