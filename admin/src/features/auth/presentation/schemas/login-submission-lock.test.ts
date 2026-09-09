import { describe, expect, it } from "vitest";

import { createLoginSubmissionLock } from "./login-submission-lock";

describe("login submission lock", () => {
  it("prevents duplicate submission until the active request releases", () => {
    const lock = createLoginSubmissionLock();

    expect(lock.tryAcquire()).toBe(true);
    expect(lock.tryAcquire()).toBe(false);
    lock.release();
    expect(lock.tryAcquire()).toBe(true);
  });
});
