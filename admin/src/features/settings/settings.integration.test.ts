import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("settings vertical slice integration", () => {
  const page = source("src/app/(protected)/dashboard/settings/page.tsx");
  const view = source(
    "src/features/settings/components/settings-page-view.tsx",
  );
  const contact = source(
    "src/features/settings/components/contact-settings.tsx",
  );
  const support = source(
    "src/features/settings/components/support-settings-panel.tsx",
  );
  const status = source(
    "src/features/settings/components/site-status-settings.tsx",
  );
  const content = source(
    "src/features/settings/components/system-content-settings.tsx",
  );

  it("guards the page and normalizes admin-only tab queries on the server", () => {
    expect(page).toContain(
      'await requireDashboardPermission("settings.manage")',
    );
    expect(page).toContain("normalizeSettingsTab");
    expect(view).toContain("isAdmin && initialTab");
    expect(view).not.toContain("display: none");
  });

  it("keeps each family in a focused component with loading error and saved states", () => {
    for (const component of [contact, support, status, content]) {
      expect(component).toContain("loading");
      expect(component).toContain("loadError");
    }
    expect(contact).toContain("updateContactFamily");
    expect(support).toContain("updateSupportBulk");
    expect(status).toContain("<Dialog");
    expect(content).toContain("systemContentKeys");
  });

  it("does not place API logic or secrets in presentation code", () => {
    for (const component of [view, contact, support, status, content]) {
      expect(component).not.toMatch(/\bfetch\s*\(/);
      expect(component).not.toContain("BACKEND_API_URL");
      expect(component).not.toContain("cms_session");
      expect(component).not.toContain("authorization");
    }
  });

  it("renders System Content as editable text and never unsafe HTML", () => {
    expect(content).toContain("<textarea");
    expect(content).not.toContain("dangerouslySetInnerHTML");
    expect(content).not.toContain("innerHTML");
  });

  it("updates critical state only after awaited backend success", () => {
    expect(support.indexOf("await updateSupport")).toBeLessThan(
      support.indexOf("setSettings({"),
    );
    const statusMutation = status.slice(
      status.indexOf("const confirm = async"),
    );
    expect(statusMutation.indexOf("await updateSiteStatus")).toBeLessThan(
      statusMutation.indexOf("setStatus(result.status)"),
    );
    expect(support).toContain("if (!pending || !settings || saving) return");
    expect(status).toContain("if (!target || saving) return");
  });

  it("has no browser-visible sensitive contract vocabulary", () => {
    const rendered = [view, contact, support, status, content].join("\n");
    for (const field of [
      "smtp_password",
      "client_secret",
      "private_key",
      "connection_string",
      "api_key",
    ])
      expect(rendered).not.toContain(field);
  });
});
