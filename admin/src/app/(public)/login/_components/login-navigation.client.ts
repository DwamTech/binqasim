type LocationReplacer = Pick<Location, "replace">;

export function navigateToDashboard(
  location: LocationReplacer = window.location,
): void {
  location.replace("/dashboard");
}
