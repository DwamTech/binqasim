import { describe, expect, it } from "vitest";

import {
  resolveCommentTargetLabel,
  type CommentTargetModuleLabels,
} from "./comment-target-labels";

const labels: CommentTargetModuleLabels = {
  articles: "مقالات المشروع",
  library: "مكتبة المشروع",
  dissertations: "الإنتاج العلمي",
  listening: "الصوتيات",
  scientificFatwas: "المسائل",
  scientificVideos: "المرئيات",
};

describe("resolveCommentTargetLabel", () => {
  it.each([
    ["site_article", "مقالات المشروع"],
    ["scientific_library_item", "مكتبة المشروع"],
    ["dissertation", "الإنتاج العلمي"],
    ["listening_series", "الصوتيات"],
    ["listening_session", "الصوتيات"],
    ["scientific_fatwa", "المسائل"],
    ["scientific_video", "المرئيات"],
  ])("maps %s to its deployment-aware module label", (type, expected) => {
    expect(resolveCommentTargetLabel(type, "اسم الباك إند", labels)).toBe(
      expected,
    );
  });

  it("preserves the backend label for future target types", () => {
    expect(
      resolveCommentTargetLabel("future_module", "محتوى جديد", labels),
    ).toBe("محتوى جديد");
  });
});
