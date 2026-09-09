import { describe, expect, it } from "vitest";

import {
  bulkDeleteCommentsSchema,
  commentDeleteResponseSchema,
  commentDetailSchema,
  commentOptionsSchema,
  commentsPageSchema,
  commentsQuerySchema,
  commentsStatsSchema,
} from "./comments.schemas";
import {
  commentsQueryFromSearchParams,
  commentsQueryToBackend,
} from "../infrastructure/comments.query";

const item = {
  id: 17,
  body: "تعليق علمي واضح على المادة.",
  status: "pending",
  ip_address: null,
  target: {
    type: "site_article",
    label: "المقالات والدراسات",
    id: 4,
    locator: "article-slug",
    title: "عنوان المقالة",
    public_path: "/articles/article-slug",
  },
  approved_at: null,
  approver: null,
  created_at: "2026-08-09T12:00:00.000000Z",
  updated_at: "2026-08-09T12:00:00.000000Z",
};

describe("comments dashboard contracts", () => {
  it("accepts the Laravel resource paginator and nullable IP address", () => {
    const parsed = commentsPageSchema.parse({
      data: [item],
      links: { first: null, last: null, prev: null, next: null },
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 1,
        from: 1,
        to: 1,
      },
      stats: { total: 1, pending: 1, approved: 0, by_type: [] },
    });

    expect(parsed.data[0]).toMatchObject({
      id: 17,
      ip_address: null,
      target: { type: "site_article", id: "4" },
    });
    expect(parsed.meta.total).toBe(1);
  });

  it("unwraps detail, options and stats envelopes", () => {
    expect(
      commentDetailSchema.parse({
        data: {
          ...item,
          status: "approved",
          approved_at: "2026-08-09T13:00:00.000000Z",
          approver: { id: 2, name: "المراجع" },
        },
        message: "تم الاعتماد",
      }),
    ).toMatchObject({ status: "approved", approver: { id: "2" } });
    expect(
      commentOptionsSchema.parse({
        data: {
          statuses: [
            { value: "pending", label: "بانتظار المراجعة" },
            { value: "approved", label: "منشور" },
          ],
          target_types: [
            { value: "site_article", label: "المقالات والدراسات" },
          ],
          limits: { bulk_delete_max: 200 },
        },
      }).target_types[0],
    ).toEqual({ value: "site_article", label: "المقالات والدراسات" });
    expect(
      commentsStatsSchema.parse({
        data: { total: 12, pending: 5, approved: 7, by_type: [] },
      }),
    ).toEqual(expect.objectContaining({ total: 12, pending: 5, approved: 7 }));
  });

  it("allowlists filters and bounds search and bulk deletion", () => {
    expect(
      commentsQuerySchema.parse({
        search: "حديث",
        status: "pending",
        target_type: "scientific_fatwa",
        page: "2",
        per_page: "50",
      }),
    ).toEqual({
      search: "حديث",
      status: "pending",
      target_type: "scientific_fatwa",
      page: 2,
      per_page: 50,
    });
    expect(() =>
      commentsQuerySchema.parse({ search: "س".repeat(181) }),
    ).toThrow();
    expect(() => bulkDeleteCommentsSchema.parse({ ids: [1, 1] })).toThrow();
    expect(bulkDeleteCommentsSchema.parse({ ids: [1, 2] })).toEqual({
      ids: [1, 2],
    });
    expect(
      commentDeleteResponseSchema.parse({
        data: { requested_count: 2, deleted_count: 2 },
        message: "تم الحذف",
      }),
    ).toEqual({
      message: "تم الحذف",
      requested_count: 2,
      deleted_count: 2,
    });
  });

  it("keeps the backend filter key behind one query mapper", () => {
    const query = commentsQueryFromSearchParams(
      new URLSearchParams("target_type=listening_session&page=3"),
    );
    expect(commentsQueryToBackend(query)).toEqual({
      target_type: "listening_session",
      page: 3,
      per_page: 20,
    });
  });
});
