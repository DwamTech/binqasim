import { describe, expect, it } from "vitest";

import {
  businessSettingsSchema,
  normalizeSettingsTab,
  phoneSettingsSchema,
  siteStatusSchema,
  socialSettingsSchema,
  supportSettingUpdateSchema,
  supportSettingsSchema,
  systemContentKeys,
  systemContentSchema,
} from "./settings.contracts";

describe("settings contracts", () => {
  it("validates and normalizes the actual Site Contact families", () => {
    expect(
      socialSettingsSchema.parse({
        youtube: "",
        twitter: null,
        facebook: "https://example.test/page",
        snapchat: null,
        instagram: null,
        tiktok: null,
      }).youtube,
    ).toBeNull();
    expect(
      socialSettingsSchema.safeParse({
        youtube: "javascript:alert(1)",
        twitter: null,
        facebook: null,
        snapchat: null,
        instagram: null,
        tiktok: null,
      }).success,
    ).toBe(false);
    expect(
      phoneSettingsSchema.safeParse({
        support_phone: "1".repeat(21),
        management_phone: null,
        backup_phone: null,
      }).success,
    ).toBe(false);
    expect(
      businessSettingsSchema.safeParse({
        address: "القاهرة",
        commercial_register: "",
        email: "wrong",
      }).success,
    ).toBe(false);
  });

  it("preserves boolean support setting types and status values", () => {
    expect(
      supportSettingsSchema.parse({
        site_status: "open",
        individual_support_enabled: true,
        institutional_support_enabled: false,
        module_articles_enabled: true,
        module_audios_enabled: true,
        module_listening_enabled: true,
        module_hadith_cards_enabled: true,
        module_visuals_enabled: true,
        module_scientific_videos_enabled: true,
        module_galleries_enabled: true,
        module_library_enabled: true,
        module_dissertations_enabled: true,
        module_scientific_fatwas_enabled: true,
        module_links_enabled: true,
      }).institutional_support_enabled,
    ).toBe(false);
    expect(
      supportSettingUpdateSchema.safeParse({
        key: "module_listening_enabled",
        value: false,
      }).success,
    ).toBe(true);
    expect(
      supportSettingsSchema.parse({
        site_status: "open",
        individual_support_enabled: true,
        institutional_support_enabled: true,
        module_articles_enabled: true,
        module_audios_enabled: true,
        module_visuals_enabled: true,
        module_scientific_videos_enabled: true,
        module_galleries_enabled: true,
        module_library_enabled: true,
        module_links_enabled: true,
      }).module_listening_enabled,
    ).toBe(true);
    expect(
      supportSettingUpdateSchema.safeParse({
        key: "module_hadith_cards_enabled",
        value: false,
      }).success,
    ).toBe(true);
    expect(
      supportSettingUpdateSchema.safeParse({
        key: "module_scientific_videos_enabled",
        value: false,
      }).success,
    ).toBe(true);
    expect(
      supportSettingUpdateSchema.safeParse({
        key: "module_dissertations_enabled",
        value: false,
      }).success,
    ).toBe(true);
    expect(
      supportSettingUpdateSchema.safeParse({
        key: "module_scientific_fatwas_enabled",
        value: false,
      }).success,
    ).toBe(true);
    expect(
      supportSettingUpdateSchema.safeParse({
        key: "smtp_password",
        value: true,
      }).success,
    ).toBe(false);
    expect(siteStatusSchema.safeParse({ status: "maintenance" }).success).toBe(
      false,
    );
  });

  it("allows only documented System Content keys", () => {
    expect(systemContentKeys).toEqual(["about_waqf", "masaref_alre3"]);
    expect(
      systemContentSchema.safeParse({
        key: "unknown",
        content: "unsafe",
        exists: false,
      }).success,
    ).toBe(false);
  });

  it("normalizes sensitive tab queries for non-admin actors", () => {
    expect(normalizeSettingsTab("support", false)).toBe("contact");
    expect(normalizeSettingsTab("status", false)).toBe("contact");
    expect(normalizeSettingsTab("content", false)).toBe("contact");
    expect(normalizeSettingsTab("support", true)).toBe("support");
    expect(normalizeSettingsTab("../support", true)).toBe("contact");
  });
});
