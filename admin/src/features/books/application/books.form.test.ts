import { describe, expect, it } from "vitest";

import { emptyBookForm } from "../domain/books.contracts";
import { createBookFormData, validateBookForm } from "./books.form";

describe("book form contract", () => {
  it("validates conditional source, cover, and series requirements", () => {
    expect(validateBookForm(emptyBookForm, {})).toMatchObject({
      title: expect.any(Array),
      description: expect.any(Array),
      author_name: expect.any(Array),
      source_link: expect.any(Array),
    });
    expect(
      validateBookForm(
        {
          ...emptyBookForm,
          title: "Book",
          description: "Description",
          author_name: "Author",
          source_type: "file",
          cover_type: "upload",
          type: "part",
        },
        {},
      ),
    ).toMatchObject({
      file_path: expect.any(Array),
      cover_path: expect.any(Array),
      book_series_id: expect.any(Array),
    });
  });

  it("serializes keywords as repeated multipart array values", () => {
    const body = createBookFormData(
      {
        ...emptyBookForm,
        title: "Book",
        description: "Description",
        author_name: "Author",
        source_link: "https://example.test/book",
        keywords: "history, library, history",
        section_id: "2",
      },
      {},
    );
    expect(body.getAll("keywords[]")).toEqual([
      "history",
      "library",
      "history",
    ]);
    expect(body.get("section_id")).toBe("2");
    expect(body.get("source_link")).toBe("https://example.test/book");
  });

  it("does not require or submit a manually entered public slug", () => {
    const values = {
      ...emptyBookForm,
      title: "Book",
      description: "Description",
      author_name: "Author",
      source_link: "https://example.test/book",
      pages_count: "120",
      edition: "First",
    };
    expect(validateBookForm(values, {}, undefined, true)).not.toHaveProperty(
      "slug",
    );
    expect(createBookFormData(values, {}, true).has("slug")).toBe(false);
  });
});
