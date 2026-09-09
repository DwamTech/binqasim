import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  getAdminRoleLabel,
  isNavigationItemActive,
} from "./admin-navigation.helpers";
import { UserMenuContent } from "./admin-header";
import {
  focusDrawerAndRestoreTrigger,
  getFocusTrapDestination,
  lockBodyScroll,
} from "./mobile-navigation.helpers";

describe("shell behavior contracts", () => {
  it("uses centralized Arabic role labels in the rendered profile content", () => {
    expect(getAdminRoleLabel("admin")).toBe("مدير النظام");
    expect(getAdminRoleLabel("editor")).toBe("محرر");
    expect(getAdminRoleLabel("author")).toBe("كاتب");
    expect(getAdminRoleLabel("reviewer")).toBe("مراجع");

    const markup = renderToStaticMarkup(
      <UserMenuContent
        adminName="أحمد محمد"
        adminEmail="ahmed@example.com"
        adminRole="reviewer"
        onAccount={vi.fn()}
        onLogout={vi.fn()}
      />,
    );
    expect(markup).toContain("أحمد محمد");
    expect(markup).toContain("ahmed@example.com");
    expect(markup).toContain("مراجع");
    expect(markup).toContain("إدارة الحساب");
    expect(markup).toContain("تسجيل الخروج");
  });

  it("marks dynamic child routes active without activating the dashboard root", () => {
    expect(
      isNavigationItemActive(
        {
          id: "sections",
          label: "Sections",
          href: "/dashboard/sections",
        },
        "/dashboard/sections/15/edit",
      ),
    ).toBe(true);
    expect(
      isNavigationItemActive(
        { id: "dashboard", label: "Dashboard", href: "/dashboard" },
        "/dashboard/sections",
      ),
    ).toBe(false);
  });

  it("locks body scrolling and restores the exact prior value on close or unmount", () => {
    const style = { overflow: "clip" };
    const restore = lockBodyScroll(style);
    expect(style.overflow).toBe("hidden");
    restore();
    expect(style.overflow).toBe("clip");

    const secondRestore = lockBodyScroll(style);
    expect(style.overflow).toBe("hidden");
    secondRestore();
    expect(style.overflow).toBe("clip");
  });

  it("focuses the mobile drawer, restores its trigger, and traps edge tabs", () => {
    const focusDrawer = vi.fn();
    const focusTrigger = vi.fn();
    const restore = focusDrawerAndRestoreTrigger(
      { focus: focusDrawer },
      { focus: focusTrigger },
    );
    expect(focusDrawer).toHaveBeenCalledOnce();
    restore();
    expect(focusTrigger).toHaveBeenCalledOnce();

    const first = {};
    const last = {};
    expect(
      getFocusTrapDestination({
        key: "Tab",
        shiftKey: true,
        activeElement: first,
        first,
        last,
      }),
    ).toBe("last");
    expect(
      getFocusTrapDestination({
        key: "Tab",
        shiftKey: false,
        activeElement: last,
        first,
        last,
      }),
    ).toBe("first");
  });
});
