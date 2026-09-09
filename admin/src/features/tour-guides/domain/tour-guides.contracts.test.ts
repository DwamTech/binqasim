import { describe, expect, it } from "vitest";

import { formatTourTime } from "./tour-guides.contracts";

describe("tour guide display formatting", () => {
  it.each([
    ["00:00", "١٢:٠٠ صباحًا"],
    ["09:05", "٩:٠٥ صباحًا"],
    ["12:30", "١٢:٣٠ مساءً"],
    ["18:45", "٦:٤٥ مساءً"],
    ["23:59:00", "١١:٥٩ مساءً"],
  ])("formats %s as a 12-hour time", (value, expected) => {
    expect(formatTourTime(value)).toBe(expected);
  });

  it("preserves an unexpected backend value", () => {
    expect(formatTourTime("مساءً")).toBe("مساءً");
  });
});
