import { describe, expect, it } from "vitest";

import { createPageContentId, isPageContentId } from "./page-content-id";

describe("createPageContentId", () => {
  it("creates a valid v4 UUID when crypto.randomUUID is unavailable", () => {
    expect(isPageContentId(createPageContentId(undefined))).toBe(true);
  });
});
