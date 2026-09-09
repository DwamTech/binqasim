import { afterEach, describe, expect, it, vi } from "vitest";

import {
  localizePagesFieldErrors,
  savePageDraft,
} from "./pages.client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Pages editor-facing API feedback", () => {
  it("localizes known and unknown field errors without exposing backend copy", () => {
    expect(
      localizePagesFieldErrors({
        title: ["The title field is required."],
        slug: ["The slug format is invalid."],
        "content.sections.0.data": ["Invalid component payload."],
        unexpected: ["Internal developer detail."],
      }),
    ).toEqual({
      title: ["أدخل عنوانًا واضحًا."],
      slug: ["استخدم حروفًا إنجليزية صغيرة وأرقامًا وشرطات فقط."],
      "content.sections.0.data": ["راجع محتوى هذا القسم وأكمل بياناته."],
      unexpected: ["راجع هذا الحقل ثم حاول مرة أخرى."],
    });
  });

  it("uses safe Arabic validation feedback and preserves the submitted draft", async () => {
    const input = {
      title: "عنوان محلي لم يُحفظ",
      content: { schema_version: 1 as const, sections: [] },
      seo_data: {},
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json(
          {
            success: false,
            error: {
              message: "The API request failed validation.",
              fieldErrors: { title: ["The title field is required."] },
            },
          },
          { status: 422 },
        ),
      ),
    );

    await expect(savePageDraft("1", input)).rejects.toMatchObject({
      status: 422,
      message: "راجع الحقول المعلّمة ثم حاول مرة أخرى.",
      fieldErrors: { title: ["أدخل عنوانًا واضحًا."] },
    });
    expect(input.title).toBe("عنوان محلي لم يُحفظ");
  });

  it("maps unknown server failures to safe Arabic feedback", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json(
          {
            success: false,
            error: { message: "SQLSTATE internal service detail" },
          },
          { status: 500 },
        ),
      ),
    );

    await expect(
      savePageDraft("1", {
        title: "عنوان",
        content: { schema_version: 1, sections: [] },
        seo_data: {},
      }),
    ).rejects.toMatchObject({
      status: 500,
      message: "خدمة الصفحات غير متاحة الآن. حاول مرة أخرى بعد قليل.",
    });
  });
});
