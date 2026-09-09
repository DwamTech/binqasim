import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("login form accessibility contract", () => {
  it("retains labelled fields, busy state, and invalid-field focus handling", () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        "src/features/auth/presentation/components/login-form.tsx",
      ),
      "utf8",
    );

    expect(source).toContain("<FormField");
    expect(source).toContain("aria-busy={submitting}");
    expect(source).toContain("focusFirstInvalidField");
    expect(source).toContain("<PasswordInput");
  });
});
