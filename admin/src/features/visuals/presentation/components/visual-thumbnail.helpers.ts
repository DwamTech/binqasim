export function isThumbnailAvailable(
  src: string | null | undefined,
  failedSource: string | undefined,
): boolean {
  return (
    src !== undefined && src !== null && src !== "" && failedSource !== src
  );
}
