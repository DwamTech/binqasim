export type LoginRateLimitInput = {
  key: string;
};

export type RateLimitResult =
  { allowed: true } | { allowed: false; retryAfterSeconds: number };

/**
 * Login routes depend on this replaceable contract. A future adapter may use
 * Redis or an upstream service; no process-local production limiter is used.
 */
export interface LoginRateLimiter {
  check(input: LoginRateLimitInput): Promise<RateLimitResult>;
}
