import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  apiFailure,
  apiSuccess,
  type ApiResponse,
} from "@/core/api/api-response";
import type { BooksRepository } from "../infrastructure/books.repository";
import { createBooksReadService } from "./books.service";

function repository(
  result: ApiResponse<unknown> = apiSuccess({
    id: 1,
    title: "Book",
    type: "single",
  }),
) {
  return {
    list: vi.fn().mockResolvedValue(result),
    detail: vi.fn().mockResolvedValue(result),
    series: vi.fn().mockResolvedValue(result),
    seriesItem: vi.fn().mockResolvedValue(result),
    authors: vi.fn().mockResolvedValue(result),
  };
}

describe("Books read service", () => {
  it("forwards a session token to all reads", async () => {
    const source = repository();
    const service = createBooksReadService(
      source as unknown as BooksRepository,
      async () => "private-token",
    );
    await service.getAdminBooks({});
    await service.getAdminBook("1");
    await service.getAdminBookSeries();
    await service.getAdminBookSeriesItem("1");
    await service.getAdminBookAuthors();
    expect(source.list).toHaveBeenCalledWith({}, "private-token");
    expect(source.detail).toHaveBeenCalledWith("1", "private-token");
    expect(source.series).toHaveBeenCalledWith("private-token");
    expect(source.seriesItem).toHaveBeenCalledWith("1", "private-token");
    expect(source.authors).toHaveBeenCalledWith("private-token");
  });

  it("does not issue unauthenticated requests without a session", async () => {
    const source = repository();
    const service = createBooksReadService(
      source as unknown as BooksRepository,
      async () => undefined,
    );
    await expect(service.getAdminBooks({})).resolves.toMatchObject({
      success: false,
      error: { code: "AUTH_SESSION_EXPIRED", status: 401 },
    });
    expect(source.list).not.toHaveBeenCalled();
  });

  it("preserves repository failures instead of manufacturing empty data", async () => {
    const failure = apiFailure("BACKEND_UNAVAILABLE", { status: 500 });
    const source = repository(failure);
    const service = createBooksReadService(
      source as unknown as BooksRepository,
      async () => "token",
    );
    await expect(service.getAdminBooks({})).resolves.toBe(failure);
  });
});
