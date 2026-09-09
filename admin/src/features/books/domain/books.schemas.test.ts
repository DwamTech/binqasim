import { describe, expect, it } from "vitest";

import {
  adminBookSchema,
  adminBookDetailResponseSchema,
  adminBooksPaginatorSchema,
  bookAuthorsSchema,
  bookSeriesSchema,
} from "./books.schemas";

const book = { id: 1, title: "Book", type: "single", ignored: true };
const detail = {
  book: {
    id: 1,
    title: "Book",
    description: "Description",
    source_type: "file",
    file_path: null,
    source_link: null,
    cover_type: "auto",
    cover_path: null,
    keywords: ["history"],
    views_count: 1,
    rating_sum: "0",
    rating_count: 0,
    author_name: "Author",
    type: "single",
    book_series_id: null,
    section_id: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-02T00:00:00Z",
    average_rating: 0,
    series: null,
    section: null,
  },
  related_parts: [],
};

describe("Books read response schemas", () => {
  it("accepts confirmed direct responses and harmless unknown properties", () => {
    expect(adminBookSchema.parse(book)).toMatchObject(book);
    expect(
      adminBooksPaginatorSchema.parse({
        current_page: 1,
        data: [book],
        per_page: 20,
        total: 1,
        ignored: true,
      }),
    ).toMatchObject({ data: [book] });
    expect(bookSeriesSchema.array().parse([{ id: 1, name: "Series" }])).toEqual(
      [{ id: 1, name: "Series" }],
    );
    expect(
      bookSeriesSchema.parse({ id: 1, name: "Series", ignored: true }),
    ).toMatchObject({ id: 1, name: "Series" });
    expect(bookAuthorsSchema.parse(["Author"])).toEqual(["Author"]);
    expect(adminBookDetailResponseSchema.parse(detail)).toMatchObject(detail);
    expect(
      adminBookSchema.parse({
        ...book,
        section_id: "16",
        book_series_id: null,
      }).section_id,
    ).toBe(16);
  });

  it("rejects malformed required response structures", () => {
    expect(adminBookSchema.safeParse({ id: 1, title: "Book" }).success).toBe(
      false,
    );
    expect(adminBooksPaginatorSchema.safeParse({ data: [] }).success).toBe(
      false,
    );
    expect(bookSeriesSchema.array().safeParse({ data: [] }).success).toBe(
      false,
    );
    expect(bookSeriesSchema.safeParse({ id: 1 }).success).toBe(false);
    expect(bookAuthorsSchema.safeParse(["Author", 2]).success).toBe(false);
    expect(
      adminBookDetailResponseSchema.parse({ book: detail.book }).related_parts,
    ).toEqual([]);
    expect(
      adminBookDetailResponseSchema.safeParse({
        ...detail,
        book: { ...detail.book, title: 1 },
      }).success,
    ).toBe(false);
    expect(
      adminBookDetailResponseSchema.safeParse({
        ...detail,
        related_parts: [{ id: 2, title: "Part", cover_path: null }],
      }).success,
    ).toBe(false);
  });
});
