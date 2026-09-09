export type SafeRedirectOptions = {
  currentPath?: string;
  fallback: string;
};

function decodePath(value: string): string | null {
  try {
    let decoded = value;

    for (let index = 0; index < 2; index += 1) {
      const nextValue = decodeURIComponent(decoded);

      if (nextValue === decoded) {
        break;
      }

      decoded = nextValue;
    }

    return decoded;
  } catch {
    return null;
  }
}

function getPathname(value: string): string | null {
  const decoded = decodePath(value);

  if (decoded === null || !decoded.startsWith("/")) {
    return null;
  }

  const normalized = decoded.replace(/\\/g, "/");

  if (normalized.startsWith("//")) {
    return null;
  }

  try {
    return new URL(normalized, "https://cms.internal").pathname;
  } catch {
    return null;
  }
}

export function safeRedirect(
  target: string | null | undefined,
  { currentPath, fallback }: SafeRedirectOptions,
): string {
  if (target === null || target === undefined) {
    return fallback;
  }

  const targetPathname = getPathname(target);

  if (targetPathname === null || targetPathname === currentPath) {
    return fallback;
  }

  return target;
}
