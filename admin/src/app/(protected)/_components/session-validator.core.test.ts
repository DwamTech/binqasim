import { describe, expect, it, vi } from "vitest";

import {
  createSessionValidationCoordinator,
  staleAfterMs,
  validationIntervalMs,
} from "./session-validator.core";

describe("session validation coordinator", () => {
  it("uses the documented five-minute interval and one-minute stale threshold", () => {
    expect(validationIntervalMs).toBe(5 * 60 * 1000);
    expect(staleAfterMs).toBe(60 * 1000);
  });

  it("deduplicates concurrent checks and retains a session during outages", async () => {
    let resolve!: (status: number) => void;
    const validate = vi.fn(
      () => new Promise<number>((done) => (resolve = done)),
    );
    const onInvalid = vi.fn();
    const coordinator = createSessionValidationCoordinator({
      now: () => 100_000,
      validate,
      onInvalid,
      broadcastInvalidation: vi.fn(),
    });
    const first = coordinator.validate();
    const second = coordinator.validate();
    expect(validate).toHaveBeenCalledOnce();
    resolve(503);
    await Promise.all([first, second]);
    expect(onInvalid).not.toHaveBeenCalled();
  });

  it("invalidates and stops exactly once for authoritative 401/403", async () => {
    const validate = vi.fn().mockResolvedValue(401);
    const onInvalid = vi.fn();
    const broadcastInvalidation = vi.fn();
    const coordinator = createSessionValidationCoordinator({
      now: () => 100_000,
      validate,
      onInvalid,
      broadcastInvalidation,
    });
    await coordinator.validate();
    await coordinator.validate();
    expect(onInvalid).toHaveBeenCalledOnce();
    expect(broadcastInvalidation).toHaveBeenCalledOnce();
    expect(validate).toHaveBeenCalledOnce();
  });

  it("only checks on focus/visibility after the session becomes stale", async () => {
    let now = 0;
    const validate = vi.fn().mockResolvedValue(200);
    const coordinator = createSessionValidationCoordinator({
      now: () => now,
      validate,
      onInvalid: vi.fn(),
      broadcastInvalidation: vi.fn(),
    });
    await coordinator.validate();
    now = staleAfterMs;
    await coordinator.checkIfStale();
    expect(validate).toHaveBeenCalledOnce();
    now += 1;
    await coordinator.checkIfStale();
    expect(validate).toHaveBeenCalledTimes(2);
  });
});
