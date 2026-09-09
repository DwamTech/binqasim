import { describe, expect, it } from "vitest";

import { validateServerEnvironment } from "@/core/env/server.schema";
import { getThemeCustomProperties } from "./theme.environment";

describe("getThemeCustomProperties", () => {
  it("maps validated environment colors to the root CSS tokens", () => {
    const environment = validateServerEnvironment({
      THEME_COLOR_GOLD: "#AABBCC",
      THEME_COLOR_GREEN: "#123456",
    });
    const properties = getThemeCustomProperties(environment);

    expect(properties["--color-gold"]).toBe("#AABBCC");
    expect(properties["--color-green"]).toBe("#123456");
    expect(properties["--font-main"]).toContain("--font-cairo");
  });
});
