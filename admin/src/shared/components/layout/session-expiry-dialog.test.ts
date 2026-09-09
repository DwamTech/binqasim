import { describe, expect, it } from "vitest";

import { formatRemainingSeconds } from "./session-expiry.helpers";

describe("formatRemainingSeconds", () => {
  it("formats remaining session time safely", () => {
    expect(formatRemainingSeconds(65)).toBe("١:٠٥");
    expect(formatRemainingSeconds(-10)).toBe("٠:٠٠");
  });
});
