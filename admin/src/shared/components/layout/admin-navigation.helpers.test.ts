import { describe, expect, it } from "vitest";

import {
  getCurrentNavigationItemId,
  getAdminInitials,
  isNavigationItemActive,
} from "./admin-navigation.helpers";

describe("admin navigation helpers", () => {
  it("recognizes an active nested navigation item", () => {
    expect(
      isNavigationItemActive(
        {
          id: "root",
          label: "Root",
          href: "/root",
          children: [{ id: "child", label: "Child", href: "/dashboard" }],
        },
        "/dashboard",
      ),
    ).toBe(true);
  });

  it("marks only the most specific sibling route as current", () => {
    const overview = {
      id: "overview",
      label: "Overview",
      href: "/dashboard/applications",
    };
    const child = {
      id: "volunteers",
      label: "Volunteers",
      href: "/dashboard/applications/volunteers",
    };
    const parent = {
      id: "applications",
      label: "Applications",
      href: "/dashboard/applications",
      children: [overview, child],
    };

    expect(
      getCurrentNavigationItemId(
        [parent],
        "/dashboard/applications/volunteers",
      ),
    ).toBe("volunteers");
    expect(
      getCurrentNavigationItemId([parent], "/dashboard/applications"),
    ).toBe("overview");
  });

  it("uses the first two Arabic name parts for initials", () => {
    expect(getAdminInitials("أحمد محمد علي")).toBe("أم");
  });
});
