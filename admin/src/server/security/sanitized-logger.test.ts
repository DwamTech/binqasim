import { describe, expect, it } from "vitest";

import {
  createSanitizedLogger,
  type SanitizedLogEntry,
} from "./sanitized-logger";

describe("createSanitizedLogger", () => {
  it("redacts sensitive values and omits raw error stacks", () => {
    const entries: SanitizedLogEntry[] = [];
    const logger = createSanitizedLogger({
      write: (entry) => entries.push(entry),
    });
    const password = "password-value";
    const token = "token-value";
    const secret = "secret-value";

    logger.error("login.failed", {
      SESSION_SECRET: secret,
      accessToken: token,
      error: new Error("internal error"),
      password,
    });

    const output = JSON.stringify(entries[0]);
    expect(output).not.toContain(password);
    expect(output).not.toContain(token);
    expect(output).not.toContain(secret);
    expect(output).not.toContain("internal error");
    expect(output).not.toContain("stack");
    expect(output).toContain("[REDACTED]");
  });
});
