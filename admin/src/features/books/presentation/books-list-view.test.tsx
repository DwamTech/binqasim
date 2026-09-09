import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { BooksListView } from "./books-list-view";

const paginator = {
  current_page: 2,
  data: [
    { id: 1, title: "عنوان طويل للغاية Long title", type: "single" as const },
  ],
  per_page: 1,
  total: 3,
};

describe("BooksListView", () => {
  it("renders the supported filter, semantic table, and preserved pagination", () => {
    const markup = renderToStaticMarkup(
      <BooksListView
        paginator={paginator}
        query={{ section_id: 2, series_id: 3, type: "single" }}
      />,
    );

    expect(markup).toContain('name="type"');
    expect(markup).toContain('name="section_id"');
    expect(markup).toContain('name="series_id"');
    expect(markup).toContain('<th scope="col">الكتاب</th>');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain("عرض");
    expect(markup).toContain("تعديل");
    expect(markup).toContain("حذف");
    expect(markup).toContain(
      "/dashboard/books?section_id=2&amp;series_id=3&amp;type=single",
    );
    expect(markup).not.toContain('name="search"');
    expect(markup).not.toContain('name="author"');
  });

  it("renders a meaningful empty state instead of a table", () => {
    const markup = renderToStaticMarkup(
      <BooksListView
        paginator={{ ...paginator, data: [], total: 0 }}
        query={{}}
      />,
    );

    expect(markup).toContain("لا توجد كتب بعد");
    expect(markup).toContain("إضافة كتاب");
    expect(markup).not.toContain("<table");
  });
});
