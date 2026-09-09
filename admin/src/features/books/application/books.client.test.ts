import { afterEach, describe, expect, it, vi } from "vitest";

import { emptyBookForm } from "../domain/books.contracts";
import {
  bookErrorMessage,
  createBook,
  deleteBook,
  listBooks,
  updateBook,
} from "./books.client";

afterEach(() => vi.unstubAllGlobals());

const ok = (data: unknown) => Response.json({ success: true, data });

describe("books browser client", () => {
  it("uses same-origin URLs and never sends authorization", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        ok({ current_page: 1, data: [], per_page: 20, total: 0 }),
      );
    vi.stubGlobal("fetch", fetcher);
    await listBooks({ section_id: 2, type: "single", page: 3 });
    expect(fetcher.mock.calls[0]?.[0]).toBe(
      "/api/books?section_id=2&type=single&page=3",
    );
    expect(JSON.stringify(fetcher.mock.calls[0]?.[1])).not.toMatch(
      /authorization|bearer|token/i,
    );
  });

  it("forwards FormData for create/update and DELETE explicitly", async () => {
    const fetcher = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(ok({ message: "saved", data: { id: 1 } })),
      );
    vi.stubGlobal("fetch", fetcher);
    const values = {
      ...emptyBookForm,
      title: "Book",
      description: "Description",
      author_name: "Author",
      source_link: "https://example.test",
    };
    await createBook(values, {});
    await updateBook("1", values, {});
    await deleteBook("1");
    expect((fetcher.mock.calls[0]?.[1] as RequestInit).body).toBeInstanceOf(
      FormData,
    );
    expect((fetcher.mock.calls[1]?.[1] as RequestInit).method).toBe("PATCH");
    expect((fetcher.mock.calls[2]?.[1] as RequestInit).method).toBe("DELETE");
  });

  it("maps important statuses and preserves AbortError", async () => {
    expect(bookErrorMessage(403)).toContain("صلاحية");
    expect(bookErrorMessage(404)).toContain("غير موجود");
    expect(bookErrorMessage(413)).toContain("حجم");
    expect(bookErrorMessage(422)).toContain("البيانات");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new DOMException("aborted", "AbortError")),
    );
    await expect(listBooks({})).rejects.toMatchObject({ name: "AbortError" });
  });
});
