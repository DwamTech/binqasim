import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

function readSource(...segments: string[]): string {
  return readFileSync(resolve(process.cwd(), "src", ...segments), "utf8");
}

describe("real login route integration", () => {
  const page = readSource("app", "(public)", "login", "page.tsx");
  const loginView = readSource(
    "app",
    "(public)",
    "login",
    "_components",
    "login-page-view.tsx",
  );
  const authShell = readSource(
    "shared",
    "components",
    "layout",
    "auth-shell.tsx",
  );

  it("keeps the server-side guest guard and mounts the BFF-backed view", () => {
    expect(page).toContain("await requireGuest();");
    expect(page).toContain("return <LoginPageView />;");
    expect(loginView).toContain("createBffLoginSubmitHandler");
    expect(loginView).toContain("navigateToDashboard");
  });

  it("does not use a demo login handler or the QA route as a destination", () => {
    expect(loginView).not.toContain("mockLoginSubmissionForDemo");
    expect(loginView).not.toContain("/ui-03a");
  });

  it("reads the login showcase title and logo from validated brand configuration", () => {
    expect(authShell).toContain("themeConfig.brand.loginShowcaseTitle");
    expect(authShell).toContain("themeConfig.brand.loginShowcaseLogo");
    expect(authShell).not.toContain("موقع فضيلة الشيخ");
    expect(existsSync(resolve(process.cwd(), "public", "logo.png"))).toBe(true);
  });

  it("shows the Dwam development credit with its public logo and safe link", () => {
    expect(authShell).toContain("تطوير شركة دوام");
    expect(authShell).toContain('src="/dwam-logo.png"');
    expect(authShell).toContain('href="https://dwam-tech.com"');
    expect(authShell).toContain('rel="noopener noreferrer"');
    expect(existsSync(resolve(process.cwd(), "public", "dwam-logo.png"))).toBe(
      true,
    );
  });
});
