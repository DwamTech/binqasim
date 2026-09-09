import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const source = (file: string) =>
  readFileSync(
    join(process.cwd(), "src/features/pages/presentation", file),
    "utf8",
  );

describe("PAGES-LIST-UX-001: Pages List Table UX & Floating Actions Menu", () => {
  it("renders the primary Edit action outside the overflow menu", () => {
    const list = source("pages-list-view.tsx");

    expect(list).toContain("فتح المحرر");
    expect(list).toContain("href={`/dashboard/pages/${item.id}`}");
    expect(list.indexOf("فتح المحرر")).toBeLessThan(
      list.indexOf("<DropdownMenu"),
    );
  });

  it("renders the permission-gated Delete action in the overflow menu", () => {
    const list = source("pages-list-view.tsx");

    expect(list).toContain('canManagePages(actor, "pages.delete")');
    expect(list.lastIndexOf("حذف الصفحة")).toBeGreaterThan(
      list.indexOf("<DropdownMenu"),
    );
  });

  it("renders secondary actions inside the floating DropdownMenu overlay", () => {
    const list = source("pages-list-view.tsx");

    expect(list).toContain("<DropdownMenu");
    expect(list).toContain("فتح الصفحة العامة");
    expect(list).toContain("سجل المراجعات");
    expect(list).toContain("نشر المسودة");
    expect(list).toContain("أرشفة");
    expect(list).toContain("استعادة");
    expect(list).toContain("<PagesIcon name=\"trash\" />");
  });

  it("separates destructive actions with danger styling", () => {
    const list = source("pages-list-view.tsx");
    const css = source("pages.module.css");

    expect(list).toContain("styles.dangerText");
    expect(css).toContain(".dangerText");
    expect(css).toContain("color: var(--color-danger)");
  });

  it("ensures row actions menu is position: absolute and taken out of normal table flow", () => {
    const css = source("pages.module.css");
    const globals = readFileSync(
      join(process.cwd(), "src/design-system/styles/globals.css"),
      "utf8",
    );

    expect(globals).toContain(".ui-menu-content {");
    expect(globals).toContain("position: absolute");
    expect(css).toContain(".rowActions");
    expect(css).toContain("position: relative");
    expect(css).toContain(".table tbody tr:has(:global([aria-expanded=\"true\"]))");
    expect(css).toContain("z-index: 30");
  });

  it("ensures opening row actions menu causes zero table row multiplication", () => {
    const list = source("pages-list-view.tsx");

    expect(list).toContain("{result.data.map((item, index) => (");
    expect(list).toContain("<tr key={item.id}>");
    expect(list).not.toContain("<tr className=\"menu-row\"");
  });

  it("applies dynamic direction flip for rows near bottom of list to prevent clipping", () => {
    const list = source("pages-list-view.tsx");

    expect(list).toContain("direction=");
    expect(list).toContain("index >= result.data.length - 2");
  });

  it("uses mature Dashboard Select primitive for status filtering and no raw <select>", () => {
    const list = source("pages-list-view.tsx");

    expect(list).toContain("<Select");
    expect(list).not.toContain("<select");
    expect(list).toContain("كل الحالات");
    expect(list).toContain("مسودة");
    expect(list).toContain("منشورة");
    expect(list).toContain("مؤرشفة");
  });

  it("preserves trusted absolute public_url for public page navigation (QA-003)", () => {
    const list = source("pages-list-view.tsx");

    expect(list).toContain("href={item.public_url}");
    expect(list).not.toContain("href={`/pages/${");
    expect(list).toContain('target="_blank"');
  });

  it("keeps search, status filters and pagination connected", () => {
    const list = source("pages-list-view.tsx");

    expect(list).toContain("<FilterPanel");
    expect(list).toContain("<Input");
    expect(list).toContain("<Select");
    expect(list).toContain("<nav className={styles.pagination}");
    expect(list).toContain("السابق");
    expect(list).toContain("التالي");
  });
});
