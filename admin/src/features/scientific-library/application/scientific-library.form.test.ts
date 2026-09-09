import { describe, expect, it } from "vitest";

import { emptyScientificLibraryForm } from "../domain/scientific-library.contracts";
import {
  createScientificLibraryFormData,
  isSecureHttpUrl,
  readScientificLibraryFormData,
  validateScientificLibraryForm,
} from "./scientific-library.form";

const validValues = {
  ...emptyScientificLibraryForm,
  slug: "hadith-work",
  title: "مصنَّف الحديث",
  author_name: "المؤلف",
  description: "وصف المصنَّف",
  content_type: "الكتب والمؤلفات",
  scientific_field: "مصطلح الحديث",
  pages_count: "248",
  edition: "الطبعة الأولى",
};

describe("scientific library form contract", () => {
  it("lets the API generate the slug from the title", () => {
    const automatic = { ...validValues, slug: "" };
    expect(
      validateScientificLibraryForm(automatic, {}, undefined, true),
    ).not.toHaveProperty("slug");
    expect(createScientificLibraryFormData(automatic, {}).has("slug")).toBe(
      false,
    );
  });

  it("requires a new PDF and rejects document formats the reader cannot display", () => {
    expect(validateScientificLibraryForm(validValues, {})).toMatchObject({
      file_path: expect.any(Array),
    });
    expect(
      validateScientificLibraryForm(validValues, {
        file: new File(["document"], "work.pdf", {
          type: "application/pdf",
        }),
      }),
    ).toEqual({});
    for (const name of ["work.doc", "work.docx", "work.epub"]) {
      expect(
        validateScientificLibraryForm(validValues, {
          file: new File(["document"], name),
        }),
      ).toMatchObject({ file_path: [expect.stringContaining("PDF فقط")] });
    }
  });

  it("accepts HTTPS links and embeds while rejecting insecure or credential URLs", () => {
    expect(isSecureHttpUrl("https://drive.google.com/file/example")).toBe(true);
    expect(isSecureHttpUrl("http://example.test/file")).toBe(false);
    expect(isSecureHttpUrl("https://user:pass@example.test/file")).toBe(false);
    expect(
      validateScientificLibraryForm(
        {
          ...validValues,
          source_type: "embed",
          source_link: "http://example.test/embed",
        },
        {},
      ),
    ).toMatchObject({ source_link: expect.any(Array) });
  });

  it("keeps download enabled for links while dropping a stale uploaded file", () => {
    const values = {
      ...validValues,
      source_type: "link" as const,
      source_link: "https://example.test/work",
      keywords: "الحديث, المصطلح",
      download_allowed: true,
      is_featured: true,
      is_published: true,
    };
    const cover = new File(["cover"], "cover.webp");
    const staleFile = new File(["pdf"], "stale.pdf", {
      type: "application/pdf",
    });
    const body = createScientificLibraryFormData(values, {
      cover,
      file: staleFile,
    });
    expect(body.get("source_link")).toBe("https://example.test/work");
    expect(body.get("download_allowed")).toBe("1");
    expect(body.get("is_featured")).toBe("1");
    expect(body.getAll("keywords[]")).toEqual(["الحديث", "المصطلح"]);
    expect(body.get("cover_path")).toBe(cover);
    expect(body.has("file_path")).toBe(false);
    expect(body.has("cover")).toBe(false);
    expect(validateScientificLibraryForm(values, { file: staleFile })).toEqual(
      {},
    );
  });

  it("forces download off only for embed sources", () => {
    const body = createScientificLibraryFormData(
      {
        ...validValues,
        source_type: "embed",
        source_link: "https://example.test/work/embed",
        download_allowed: true,
      },
      {},
    );

    expect(body.get("download_allowed")).toBe("0");
  });

  it("round-trips sanitized multipart data for the BFF", () => {
    const file = new File(["pdf"], "work.pdf");
    const body = createScientificLibraryFormData(validValues, { file });
    body.set("unexpected_admin_field", "must-not-forward");
    const parsed = readScientificLibraryFormData(body);
    expect(parsed?.files.file).toBe(file);
    expect(parsed?.values.title).toBe("مصنَّف الحديث");
    expect(
      createScientificLibraryFormData(parsed!.values, parsed!.files).has(
        "unexpected_admin_field",
      ),
    ).toBe(false);
  });

  it("explicitly clears empty keywords and an existing cover on update", () => {
    const body = createScientificLibraryFormData(
      { ...validValues, keywords: "" },
      { removeCover: true },
    );

    expect(body.get("keywords")).toBe("");
    expect(body.getAll("keywords[]")).toEqual([]);
    expect(body.get("cover_path")).toBe("");

    const parsed = readScientificLibraryFormData(body);
    expect(parsed?.values.keywords).toBe("");
    expect(parsed?.files.removeCover).toBe(true);
    const forwarded = createScientificLibraryFormData(
      parsed!.values,
      parsed!.files,
    );
    expect(forwarded.get("keywords")).toBe("");
    expect(forwarded.get("cover_path")).toBe("");
  });

  it("lets a newly selected cover win over a pending cover removal", () => {
    const cover = new File(["cover"], "replacement.webp", {
      type: "image/webp",
    });
    const body = createScientificLibraryFormData(validValues, {
      cover,
      removeCover: true,
    });

    expect(body.get("cover_path")).toBe(cover);
  });
});
