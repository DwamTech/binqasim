import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { BooksDetailView } from "./books-detail-view";

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
    keywords: ["history"],
    views_count: 1,
    rating_sum: 0,
    rating_count: 0,
    author_name: "Author",
    type: "part" as const,
    book_series_id: 2,
    section_id: 3,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-02T00:00:00Z",
    average_rating: 0,
    series: { name: "Series" },
    section: { name: "Section" },
  },
  related_parts: [
    { id: 2, title: "Part", cover_path: null, cover_type: "auto" as const },
  ],
};

describe("BooksDetailView", () => {
  it("renders the verified wrapper without exposing relative storage paths", () => {
    const markup = renderToStaticMarkup(
      <BooksDetailView
        detail={detail}
        fileUrl="https://media.example.test/storage/books/example.pdf"
      />,
    );

    expect(markup).toContain("أجزاء من نفس السلسلة");
    expect(markup).toContain("تعديل الكتاب");
    expect(markup).toContain("حذف الكتاب");
    expect(markup).toContain("Series");
    expect(markup).toContain("Section");
    expect(markup).toContain("history");
    expect(markup).toContain("غلاف Book");
    expect(markup).toContain(
      "https://media.example.test/storage/books/example.pdf",
    );
    expect(markup).not.toContain('href="books/example.pdf"');
    expect(markup).not.toContain('href="books/cover.webp"');
  });
});
