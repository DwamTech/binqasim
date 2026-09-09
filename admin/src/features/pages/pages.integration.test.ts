import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const source = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

describe("Pages Dashboard vertical slice isolation", () => {
  it("uses the existing generic module guard and Pages-only BFF boundary", () => {
    const layout = source("src/app/(protected)/dashboard/pages/layout.tsx");
    const bff = source("src/features/pages/application/pages-bff.core.ts");

    expect(layout).toContain('requireDashboardModuleEnabled("pages")');
    expect(layout).toContain('requireDashboardPermission("pages.view")');
    expect(bff).toContain('"/admin/pages"');
    expect(bff).toContain("`/admin/pages/${pageId}/media`");
    expect(bff).toContain("bodyStream: request.body");
    expect(bff).not.toContain("BACKEND_API_URL");
  });

  it("keeps draft SEO safely merged and Hero media identity inside the structured draft contract", () => {
    const editor = source("src/features/pages/presentation/page-editor.tsx");
    const seo = source("src/features/pages/domain/page-seo.ts");
    const contracts = source("src/features/pages/domain/pages.contracts.ts");

    expect(editor).toContain(
      "seo_data: mergePageSeo(seoOriginal, seoValues, seoTouched)",
    );
    expect(editor).toContain("PageSeoEditor");
    expect(seo).toContain("legacy-list");
    expect(seo).toContain("validateCanonical");
    expect(editor).toContain("uploadPageMedia");
    expect(contracts).toContain("media_id: identifier");
    expect(contracts).not.toContain("className");
  });

  it("keeps the Pages builder bounded to the registered section contracts", () => {
    const editor = source("src/features/pages/presentation/page-editor.tsx");
    const catalog = source(
      "src/features/pages/presentation/page-component-catalog.tsx",
    );
    const contracts = source("src/features/pages/domain/pages.contracts.ts");

    expect(catalog).toContain('type: "rich_content"');
    expect(catalog).toContain('type: "image_text"');
    expect(editor).toContain("moveSection");
    expect(editor).toContain(
      "mergePageSeo(seoOriginal, seoValues, seoTouched)",
    );
    expect(contracts).toContain('z.literal("rich_content")');
    expect(contracts).toContain('z.literal("image_text")');
    expect(contracts).toContain("gallerySectionSchema");
  });

  it("keeps media editors bounded to video audio gallery and stable IDs", () => {
    const editor = source("src/features/pages/presentation/page-editor.tsx");
    const sectionEditor = source(
      "src/features/pages/presentation/page-section-editor.tsx",
    );
    const catalog = source(
      "src/features/pages/presentation/page-component-catalog.tsx",
    );
    const contracts = source("src/features/pages/domain/pages.contracts.ts");
    expect(catalog).toContain('type: "video"');
    expect(catalog).toContain('type: "audio"');
    expect(catalog).toContain('type: "gallery"');
    expect(editor).toContain("gallery:");
    expect(sectionEditor).toContain("moveItem");
    expect(contracts).toContain('z.literal("video")');
    expect(contracts).toContain('z.literal("audio")');
    expect(contracts).toContain('z.literal("gallery")');
  });

  it("keeps all twelve component editors explicit and bounded without drag and drop", () => {
    const sectionEditor = source(
      "src/features/pages/presentation/page-section-editor.tsx",
    );
    const catalog = source(
      "src/features/pages/presentation/page-component-catalog.tsx",
    );
    const contracts = source("src/features/pages/domain/pages.contracts.ts");
    expect(catalog).toContain('type: "cards"');
    expect(catalog).toContain('type: "statistics"');
    expect(catalog).toContain('type: "downloads"');
    expect(contracts).toContain('z.literal("cards")');
    expect(contracts).toContain('z.literal("statistics")');
    expect(contracts).toContain('z.literal("downloads")');
    expect(sectionEditor).not.toContain("dnd-kit");
    expect(catalog).toContain("newFaq");
    expect(catalog).toContain("newCta");
    expect(sectionEditor).toContain("FaqFields");
    expect(sectionEditor).toContain("CtaFields");
    expect(sectionEditor).toContain("RichTextEditor");
    expect(sectionEditor).toContain("إضافة سؤال");
    expect(sectionEditor).toContain("نقل القسم للأعلى");
    expect(sectionEditor).toContain("نقل القسم للأسفل");
    expect(contracts).toContain('z.literal("faq")');
    expect(contracts).toContain('z.literal("cta")');
  });
  it("keeps preview permission-aware, BFF-only, and explicitly limited to the saved draft", () => {
    const editor = source("src/features/pages/presentation/page-editor.tsx");
    const client = source("src/features/pages/application/pages.client.ts");
    const bff = source("src/features/pages/application/pages-bff.core.ts");
    expect(editor).toContain('canManagePages(actor, "pages.preview")');
    expect(editor).toContain("createPagePreview(id)");
    expect(editor).toContain("آخر مسودة محفوظة");
    expect(client).toContain("/api/pages/${encodeURIComponent(id)}/preview");
    expect(client).not.toContain(
      "/admin/pages/${encodeURIComponent(id)}/preview",
    );
    expect(bff).toContain("/admin/pages/${pageId}/preview");
  });
  it("keeps revision history Pages-owned, read-only, and restores only as a new Draft", () => {
    const editor = source("src/features/pages/presentation/page-editor.tsx");
    const history = source(
      "src/features/pages/presentation/revision-history.tsx",
    );
    const route = source(
      "src/app/(protected)/dashboard/pages/[id]/revisions/page.tsx",
    );
    expect(editor).toContain("Revision History");
    expect(route).toContain("requireDashboardPermission('pages.view')");
    expect(history).toContain("Restore as New Draft");
    expect(history).toContain("Existing history will remain unchanged");
    expect(history).toContain("Published page will not change");
    expect(history).toContain("getPageRevision");
    expect(history).toContain("restorePageRevision");
    expect(history).toContain("is_current_draft");
    expect(history).toContain("is_current_published");
    expect(history).toContain("was_published");
    expect(history).not.toContain("<input");
    expect(history).not.toContain("savePageDraft");
  });
});
