import { describe, expect, it } from "vitest";

import { validateServerEnvironment } from "./server.schema";

describe("validateServerEnvironment", () => {
  it("uses safe defaults when optional values are absent", () => {
    expect(validateServerEnvironment({})).toMatchObject({
      NODE_ENV: "development",
      LOG_LEVEL: "info",
      SESSION_IDLE_TIMEOUT_MINUTES: 30,
      SESSION_ABSOLUTE_TIMEOUT_HOURS: 8,
      DASHBOARD_MODULE_ARTICLES_ENABLED: true,
      DASHBOARD_MODULE_GOVERNANCE_ENABLED: true,
      DASHBOARD_MODULE_PROGRAMS_ENABLED: true,
      DASHBOARD_MODULE_LEGACY_VISUALS_ENABLED: true,
      DASHBOARD_MODULE_LIBRARY_ENABLED: false,
      DASHBOARD_MODULE_DISSERTATIONS_ENABLED: false,
      DASHBOARD_MODULE_LISTENING_ENABLED: false,
      DASHBOARD_MODULE_HADITH_CARDS_ENABLED: false,
      DASHBOARD_MODULE_SCIENTIFIC_FATWAS_ENABLED: false,
      DASHBOARD_MODULE_SCIENTIFIC_VIDEOS_ENABLED: false,
      DASHBOARD_MODULE_LIBRARY_INDEXES_ENABLED: false,
      DASHBOARD_MODULE_COMMENTS_ENABLED: false,
      DASHBOARD_MODULE_TOUR_GUIDES_ENABLED: false,
      THEME_COLOR_GOLD: "#D9BB5D",
      THEME_COLOR_GREEN: "#156D54",
      THEME_COLOR_DARK_GREEN: "#01231C",
    });
  });

  it("parses deployment module flags without exposing them publicly", () => {
    expect(
      validateServerEnvironment({
        DASHBOARD_MODULE_ARTICLES_ENABLED: "true",
        DASHBOARD_MODULE_GOVERNANCE_ENABLED: "false",
        DASHBOARD_MODULE_PROGRAMS_ENABLED: "false",
        DASHBOARD_MODULE_LEGACY_VISUALS_ENABLED: "false",
        DASHBOARD_MODULE_LIBRARY_ENABLED: "true",
        DASHBOARD_MODULE_DISSERTATIONS_ENABLED: "false",
        DASHBOARD_MODULE_LISTENING_ENABLED: "true",
        DASHBOARD_MODULE_HADITH_CARDS_ENABLED: "true",
        DASHBOARD_MODULE_SCIENTIFIC_FATWAS_ENABLED: "true",
        DASHBOARD_MODULE_SCIENTIFIC_VIDEOS_ENABLED: "true",
        DASHBOARD_MODULE_LIBRARY_INDEXES_ENABLED: "true",
        DASHBOARD_MODULE_COMMENTS_ENABLED: "true",
        DASHBOARD_MODULE_TOUR_GUIDES_ENABLED: "true",
      }),
    ).toMatchObject({
      DASHBOARD_MODULE_ARTICLES_ENABLED: true,
      DASHBOARD_MODULE_GOVERNANCE_ENABLED: false,
      DASHBOARD_MODULE_PROGRAMS_ENABLED: false,
      DASHBOARD_MODULE_LEGACY_VISUALS_ENABLED: false,
      DASHBOARD_MODULE_LIBRARY_ENABLED: true,
      DASHBOARD_MODULE_DISSERTATIONS_ENABLED: false,
      DASHBOARD_MODULE_LISTENING_ENABLED: true,
      DASHBOARD_MODULE_HADITH_CARDS_ENABLED: true,
      DASHBOARD_MODULE_SCIENTIFIC_FATWAS_ENABLED: true,
      DASHBOARD_MODULE_SCIENTIFIC_VIDEOS_ENABLED: true,
      DASHBOARD_MODULE_LIBRARY_INDEXES_ENABLED: true,
      DASHBOARD_MODULE_COMMENTS_ENABLED: true,
      DASHBOARD_MODULE_TOUR_GUIDES_ENABLED: true,
    });
  });

  it("rejects a non-http API endpoint", () => {
    expect(() =>
      validateServerEnvironment({ BACKEND_API_URL: "ftp://example.com" }),
    ).toThrow("BACKEND_API_URL");
  });

  it("normalizes a dashboard origin and rejects URLs with paths", () => {
    expect(
      validateServerEnvironment({
        DASHBOARD_ORIGIN: "https://admin.example.com:443/",
      }).DASHBOARD_ORIGIN,
    ).toBe("https://admin.example.com");
    expect(() =>
      validateServerEnvironment({
        DASHBOARD_ORIGIN: "https://admin.example.com/dashboard",
      }),
    ).toThrow("DASHBOARD_ORIGIN");
  });

  it("rejects unsafe or incomplete theme colors", () => {
    expect(() =>
      validateServerEnvironment({ THEME_COLOR_GREEN: "green; color: red" }),
    ).toThrow("THEME_COLOR_GREEN");
    expect(() =>
      validateServerEnvironment({ THEME_COLOR_GOLD: "#fff" }),
    ).toThrow("THEME_COLOR_GOLD");
  });

  it("rejects core theme pairs with inaccessible contrast", () => {
    expect(() =>
      validateServerEnvironment({
        THEME_COLOR_GREEN: "#EEEEEE",
      }),
    ).toThrow("WCAG AA");
  });
});
