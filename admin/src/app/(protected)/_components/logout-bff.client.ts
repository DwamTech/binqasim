import { broadcastLogout } from "./session-validator.client";

type Fetcher = typeof fetch;
type LocationReplacer = Pick<Location, "replace">;

export async function submitLogoutToBff(
  fetcher: Fetcher = fetch,
): Promise<boolean> {
  try {
    const response = await fetcher("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function navigateToLogin(
  location: LocationReplacer = window.location,
): void {
  location.replace("/login");
}

export function createBffLogoutHandler(
  navigate: () => void | Promise<void>,
  fetcher: Fetcher = fetch,
): () => Promise<void> {
  return async () => {
    await submitLogoutToBff(fetcher);
    broadcastLogout();
    await navigate();
  };
}
