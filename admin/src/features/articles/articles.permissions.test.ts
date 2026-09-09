import { describe, expect, it } from "vitest";

import type { AdminSummary } from "../auth/domain/auth.contracts";
import {
  canCreateArticle,
  canDeleteArticle,
  canDeleteArticleMedia,
  canEditArticle,
  canToggleArticleStatus,
} from "./articles.permissions";

const actor = (
  role: AdminSummary["role"],
  id = "1",
  permitted = true,
): AdminSummary => ({
  id,
  name: role,
  email: `${role}@example.com`,
  role,
  isActive: true,
  dashboardPermissions: permitted ? ["articles.manage"] : [],
});
const own = { user_id: "1" };
const other = { user_id: "2" };

describe("article action authorization", () => {
  it("allows admins every article action", () => {
    const admin = actor("admin");
    expect(canCreateArticle(admin)).toBe(true);
    expect(canEditArticle(admin, other)).toBe(true);
    expect(canDeleteArticle(admin, other)).toBe(true);
    expect(canDeleteArticleMedia(admin, other)).toBe(true);
    expect(canToggleArticleStatus(admin)).toBe(true);
  });

  it("allows permitted authors to create and manage only their own article", () => {
    const author = actor("author");
    expect(canCreateArticle(author)).toBe(true);
    expect(canEditArticle(author, own)).toBe(true);
    expect(canDeleteArticle(author, own)).toBe(true);
    expect(canDeleteArticleMedia(author, own)).toBe(true);
    expect(canEditArticle(author, other)).toBe(false);
    expect(canToggleArticleStatus(author)).toBe(false);
  });

  it.each(["editor", "reviewer"] as const)(
    "keeps permitted %s read-only",
    (role) => {
      const readOnly = actor(role);
      expect(canCreateArticle(readOnly)).toBe(false);
      expect(canEditArticle(readOnly, own)).toBe(false);
      expect(canDeleteArticle(readOnly, own)).toBe(false);
      expect(canToggleArticleStatus(readOnly)).toBe(false);
    },
  );

  it("fails closed without permission or author identity", () => {
    expect(canCreateArticle(actor("author", "1", false))).toBe(false);
    expect(canEditArticle(actor("author"), { user_id: "" })).toBe(false);
  });
});
