import { describe, expect, it } from "vitest";

import { mapAdminBookDetailMedia } from "./books.media-mapper";

const detail = {
  book: {
    id: 1,
    title: "Book",
    description: "Description",
    source_type: "file" as const,
    file_path: "books/example.pdf",
    source_link: null,
    cover_type: "auto" as const,
    cover_path: "books/cover.webp",
    keywords: null,
    views_count: 0,
    rating_sum: 0,
    rating_count: 0,
    author_name: "Author",
    type: "single" as const,
    book_series_id: null,
    section_id: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    average_rating: 0,
    series: null,
    section: null,
  },
  related_parts: [],
};

describe("Books detail media mapper", () => {
  it("resolves relative storage paths before presentation", () => {
    expect(
      mapAdminBookDetailMedia(detail, "https://api.example.test/api"),
    ).toEqual({
      coverUrl: "https://api.example.test/storage/books/cover.webp",
      fileUrl: "https://api.example.test/storage/books/example.pdf",
    });
  });
});
