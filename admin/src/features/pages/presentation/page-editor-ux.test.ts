import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const source = (file: string) =>
  readFileSync(
    join(process.cwd(), "src/features/pages/presentation", file),
    "utf8",
  );

describe("Pages editor information architecture", () => {
  it("puts the content builder before secondary Page and SEO settings", () => {
    const editor = source("page-editor.tsx");

    expect(editor).toContain("styles.editorLayout");
    expect(editor).toContain("<main className={styles.editorContent}");
    expect(editor).toContain("<aside className={styles.editorSettings}");
    expect(editor.indexOf("styles.editorContent")).toBeLessThan(
      editor.indexOf("styles.editorSettings"),
    );
    // The page-settings panel carries a ref for programmatic open/focus on validation.
    expect(editor).toMatch(/<details ref=\{pageSettingsRef\} className=\{styles\.settingsPanel\} open>/);
    // The SEO panel is closed by default (no open attribute) and also carries a ref.
    expect(editor).toMatch(/<details ref=\{seoSettingsRef\} className=\{styles\.settingsPanel\}>/);
    // Confirm the SEO panel has NO open attribute (collapsed by default).
    expect(editor).not.toMatch(/<details ref=\{seoSettingsRef\} className=\{styles\.settingsPanel\} open>/);
  });

  it("uses one sticky action area with a clear primary and tertiary overflow", () => {
    const editor = source("page-editor.tsx");
    const css = source("pages.module.css");

    expect(editor.match(/styles\.actionBar/g)).toHaveLength(1);
    expect(editor).toContain("حفظ المسودة");
    expect(editor).toContain("<DropdownMenu");
    expect(editor).toContain("سجل المراجعات");
    expect(css).toContain("position: sticky");
    expect(css).toContain(".primaryActions");
  });

  it("keeps lifecycle, saved state, path and version context in the compact shell", () => {
    const editor = source("page-editor.tsx");

    expect(editor).toContain("styles.editorHeader");
    expect(editor).toContain("pageStatusLabels[page.status]");
    expect(editor).toContain("/pages/{page.path}");
    expect(editor).toContain("تغييرات غير محفوظة");
    expect(editor).toContain("المسودة المحفوظة: النسخة");
    expect(editor).not.toContain("<HeroSection");
  });

  it("places Arabic validation beside identity, SEO, section and media fields", () => {
    const editor = source("page-editor.tsx");

    expect(editor).toContain("message={fieldErrors.title}");
    expect(editor).toContain("message={fieldErrors.slug}");
    expect(editor).toContain("canonicalError={canonicalError}");
    expect(editor).toContain("sectionError?.sectionId === section.id");
    expect(editor).toContain("target?.scrollIntoView");
    expect(editor).toContain('uploadError={(slot = "primary") =>');
    expect(editor).not.toContain("reason.message");
  });

  it("collapses the desktop columns and actions without horizontal overflow", () => {
    const css = source("pages.module.css");

    expect(css).toContain(
      "grid-template-columns: minmax(0, 2.1fr) minmax(19rem, 0.82fr)",
    );
    expect(css).toContain("@media (max-width: 70rem)");
    expect(css).toContain("@media (max-width: 52rem)");
    expect(css).toContain("@media (max-width: 38rem)");
    expect(css).toContain("grid-template-columns: minmax(0, 1fr)");
  });
});
