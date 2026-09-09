import { describe, expect, it } from "vitest";

import { mapHttpFailure } from "./api-response";

describe("mapHttpFailure", () => {
  it("maps HTTP failures to stable error codes", () => {
    expect(mapHttpFailure(422)).toEqual({
      success: false,
      error: {
        code: "VALIDATION_FAILED",
        message: "The API request failed validation.",
      },
    });
  });

  it("preserves normalized field errors and request IDs", () => {
    expect(
      mapHttpFailure(422, {
        fieldErrors: { email: ["Must be a valid email address."] },
        requestId: "request-1",
      }),
    ).toEqual({
      success: false,
      error: {
        code: "VALIDATION_FAILED",
        message: "The API request failed validation.",
        fieldErrors: { email: ["Must be a valid email address."] },
        requestId: "request-1",
      },
    });
  });

  it("uses only whitelisted backend codes", () => {
    expect(mapHttpFailure(401, { backendCode: "AUTH_ACCOUNT_LOCKED" })).toEqual(
      {
        success: false,
        error: {
          code: "AUTH_ACCOUNT_LOCKED",
          message: "The account is locked.",
        },
      },
    );
  });
});
