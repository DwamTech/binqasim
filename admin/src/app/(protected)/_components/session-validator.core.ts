export const validationIntervalMs = 5 * 60 * 1000;
export const staleAfterMs = 60 * 1000;
export const authChannelName = "cms-auth";

export type SessionValidatorEnvironment = {
  now: () => number;
  validate: () => Promise<number>;
  onInvalid: () => void;
  broadcastInvalidation: () => void;
};

/** Pure coordinator: keeps browser event wiring out of auth policy. */
export function createSessionValidationCoordinator(
  environment: SessionValidatorEnvironment,
) {
  let inFlight: Promise<void> | null = null;
  let lastCheck = 0;
  let stopped = false;
  let invalidated = false;

  const invalidate = () => {
    if (invalidated) return;
    invalidated = true;
    stopped = true;
    environment.broadcastInvalidation();
    environment.onInvalid();
  };

  const validate = () => {
    if (stopped || inFlight !== null) return inFlight ?? Promise.resolve();
    inFlight = environment
      .validate()
      .then((status) => {
        if (status === 401 || status === 403) invalidate();
        else if (status >= 200 && status < 300) lastCheck = environment.now();
      })
      // Availability failures are deliberately not authentication failures.
      .catch(() => undefined)
      .finally(() => {
        inFlight = null;
      });
    return inFlight;
  };

  return {
    validate,
    checkIfStale: () => {
      if (environment.now() - lastCheck > staleAfterMs) return validate();
      return Promise.resolve();
    },
    stop: () => {
      stopped = true;
    },
  };
}
