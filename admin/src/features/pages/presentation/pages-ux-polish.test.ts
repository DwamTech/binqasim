import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PAGE_COMPONENT_DEFINITIONS,
  createPageSection,
} from "./page-component-catalog";

const source = (file: string) =>
  readFileSync(
    join(process.cwd(), "src/features/pages/presentation", file),
    "utf8",
  );

describe("Pages Dashboard UX polish", () => {
  it("orders editor loading, error, not-found and loaded states explicitly", () => {
    const editor = source("page-editor.tsx");
    expect(editor).toContain("if (loading)");
    expect(editor).toContain("loadError || notFound || !page");
    expect(editor).toContain("إعادة المحاولة");
    expect(editor.indexOf("if (loading)")).toBeLessThan(
      editor.indexOf("loadError || notFound || !page"),
    );
  });

  it("uses the focus-managed shared dialog for unsaved and lifecycle confirmations", () => {
    const files = [
      "page-editor.tsx",
      "pages-list-view.tsx",
      "revision-history.tsx",
      "unsaved-changes-dialog.tsx",
    ];
    expect(files.map(source).join("\n")).not.toContain("window.confirm");
    expect(source("pages-confirm-dialog.tsx")).toContain("<Dialog");
    expect(source("unsaved-changes-dialog.tsx")).toContain(
      "PagesConfirmDialog",
    );
  });

  it("keeps all twelve existing component contracts in a grouped picker", () => {
    expect(PAGE_COMPONENT_DEFINITIONS).toHaveLength(12);
    expect(
      new Set(PAGE_COMPONENT_DEFINITIONS.map((item) => item.type)).size,
    ).toBe(12);
    expect(
      new Set(PAGE_COMPONENT_DEFINITIONS.map((item) => item.group)),
    ).toEqual(new Set(["content", "media", "utility"]));
    for (const definition of PAGE_COMPONENT_DEFINITIONS) {
      expect(definition.label).not.toBe("");
      expect(definition.description).not.toBe("");
      expect(createPageSection(definition.type).type).toBe(definition.type);
    }
  });

  it("keeps collapse state in UI state and outside Page contracts", () => {
    const editor = source("page-editor.tsx");
    const contracts = readFileSync(
      join(process.cwd(), "src/features/pages/domain/pages.contracts.ts"),
      "utf8",
    );
    expect(editor).toContain("collapsedSections");
    expect(contracts).not.toContain("collapsedSections");
    expect(contracts).not.toContain("is_collapsed");
  });

  it("provides accessible move controls without drag and drop", () => {
    const section = source("page-section-editor.tsx");
    const repeatable = source("repeatable-item-shell.tsx");
    expect(section).toContain('label="نقل القسم للأعلى"');
    expect(repeatable).toContain("نقل ${label} للأعلى");
    expect(`${section}\n${repeatable}`).not.toContain("dnd-kit");
  });

  it("uses a reusable media field with native input, upload and preview states", () => {
    const media = source("media-upload-field.tsx");
    expect(media).toContain('type="button"');
    expect(media).toContain('type="file"');
    expect(media).toContain("جارٍ رفع الصورة…");
    expect(media).toContain("استبدال الصورة");
    expect(media).toContain("media?.mime_type");
    expect(media).not.toContain("media.path");
    expect(media).not.toContain("media.disk");
  });

  it("makes the parent selector searchable, paginated and failure-visible", () => {
    const parent = source("parent-page-selector.tsx");
    expect(parent).toContain('query.set("search", search)');
    expect(parent).toContain("تعذر تحميل الصفحات الأم");
    expect(parent).toContain("صفحة رئيسية بلا أم");
    expect(parent).toContain("result.meta.last_page");
  });

  it("applies lifecycle badges, deliberate filters and action overflow to the list", () => {
    const list = source("pages-list-view.tsx");
    expect(list).toContain("<FilterPanel");
    expect(list).toContain("<Badge");
    expect(list).toContain("<DropdownMenu");
    expect(list).toContain("مسح الفلاتر");
    expect(list).toContain("<EmptyState");
  });

  it("groups primary SEO fields separately from advanced controls without changing merge semantics", () => {
    const seo = source("page-seo-editor.tsx");
    const editor = source("page-editor.tsx");
    expect(seo).toContain("إعدادات SEO المتقدمة");
    expect(seo).toContain("بيانات قديمة محفوظة");
    expect(editor).toContain(
      "mergePageSeo(seoOriginal, seoValues, seoTouched)",
    );
  });

  it("presents revision history as localized read-only editorial data", () => {
    const history = source("revision-history.tsx");
    expect(history).toContain("المسودة الحالية");
    expect(history).toContain("عرض للقراءة فقط");
    expect(history).toContain("ملخص SEO");
    expect(history).not.toContain("JSON.stringify");
    expect(history).not.toContain("<input");
  });

  it("contains Pages-owned responsive layouts for editor and repeatable items", () => {
    const css = source("pages.module.css");
    expect(css).toContain("@media (max-width: 70rem)");
    expect(css).toContain("@media (max-width: 52rem)");
    expect(css).toContain(".sectionActions");
    expect(css).toContain(".itemActions");
    expect(css).toContain("max-block-size: 18rem");
  });
});
