import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const editor = readFileSync(
  join(process.cwd(), "src/features/pages/presentation/page-editor.tsx"),
  "utf8",
);
const dialog = readFileSync(
  join(
    process.cwd(),
    "src/features/pages/presentation/unsaved-changes-dialog.tsx",
  ),
  "utf8",
);
const guard = readFileSync(
  join(
    process.cwd(),
    "src/features/pages/application/pages-unsaved-navigation-guard.core.ts",
  ),
  "utf8",
);
const guardHook = readFileSync(
  join(
    process.cwd(),
    "src/features/pages/application/use-pages-unsaved-navigation-guard.ts",
  ),
  "utf8",
);

describe("Pages editor unsaved-changes safety", () => {
  it("derives the status from the semantic Draft baseline and retains failed local edits", () => {
    expect(editor).toContain("pageEditorDraftState(");
    expect(editor).toContain("arePageEditorStatesEqual");
    expect(editor).toContain('operation === "save"');
    expect(editor).toContain("جارٍ حفظ المسودة…");
    expect(editor).toContain("فشل الحفظ. بقيت تغييراتك المحلية كما هي.");
    expect(editor).toContain("setSaveFailed(true)");
    expect(editor).toContain("await savePageDraft");
    expect(editor).toContain("hydrate(");
  });

  it("registers browser protection only while dirty and cleans it up", () => {
    expect(editor).toContain("usePagesUnsavedNavigationGuard({");
    expect(guard).toContain('"beforeunload"');
    expect(guard).toContain('"popstate"');
    expect(guard).toContain('addEventListener("click"');
    expect(guard).toContain("this.options.document.removeEventListener(");
    expect(guardHook).toContain("controller.dispose()");
  });

  it("protects Pages-owned navigation with explicit stay or discard choices", () => {
    expect(editor).toContain("function requestNavigation(target: string)");
    expect(editor).toContain("requestGuardedNavigation(target)");
    expect(editor).toContain("hasPendingNavigation");
    expect(editor).toContain("<UnsavedChangesDialog");
    expect(dialog).toContain("البقاء في المحرر");
    expect(dialog).toContain("تجاهل التغييرات والمغادرة");
    expect(dialog).toContain("PagesConfirmDialog");
    expect(editor).not.toContain(
      "savePageDraft(id, { title, content: { schema_version: 1, sections: normalizedSections(sections) }, seo_data: mergePageSeo(seoOriginal, seoValues, seoTouched), ...(!published ? { slug, parent_id: parentId ? Number(parentId) : null } : {}) }).then",
    );
  });

  it("blocks lifecycle and preview actions while dirty and locks duplicate requests", () => {
    expect(editor).toContain("isDirty || isMutationActive || hasActiveUpload");
    expect(editor).toContain("operationRef.current !== null");
    expect(editor).toContain("function beginOperation");
    expect(editor).toContain("uploadingRef.current.has(key)");
    expect(editor).toContain("احفظ المسودة قبل معاينة أحدث تغييراتك");
    expect(editor).not.toContain("setInterval");
    expect(editor).not.toContain("localStorage");
    expect(editor).not.toContain("sessionStorage");
    expect(editor).not.toContain("window.confirm");
  });

  it("has one Pages-owned guard and no legacy independent leave target", () => {
    expect(editor).not.toContain("leaveTarget");
    expect(editor).not.toContain("discardAndLeave");
    expect(guard).toContain("if (this.pending !== null) return;");
    expect(guard).not.toContain("history.pushState =");
    expect(guard).not.toContain("history.replaceState =");
  });
});
