/**
 * Creates an RFC 4122 v4 UUID for client-created Page sections and items.
 *
 * `crypto.randomUUID` is not available in every embedded/legacy browser. The
 * fallback still has the UUID shape required by the API, preventing a generic
 * BFF validation failure when a user adds a gallery item.
 */
export function createPageContentId(
  randomUuid = globalThis.crypto?.randomUUID?.bind(globalThis.crypto),
): string {
  if (randomUuid) return randomUuid();

  const hex = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  );
  hex[12] = "4";
  hex[16] = ((Number.parseInt(hex[16] ?? "0", 16) & 0x3) | 0x8).toString(16);

  return `${hex.slice(0, 8).join("")}-${hex.slice(8, 12).join("")}-${hex
    .slice(12, 16)
    .join("")}-${hex.slice(16, 20).join("")}-${hex.slice(20).join("")}`;
}

export function isPageContentId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
