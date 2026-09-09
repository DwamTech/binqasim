import { describe, expect, it } from "vitest";

import {
  libraryIndexSubmissionSchema,
  libraryIndexSubmissionResponseSchema,
  libraryIndexSubmissionsResponseSchema,
} from "./library-indexes.schemas";

const item = {
  id: 7,
  type: "golden_visit",
  name: "زائر المكتبة",
  title: null,
  visit_date: "2026-08-09",
  status: "pending",
  image_url: "/storage/library-indexes/golden/example.webp",
  reviewed_at: null,
  reviewer: null,
  rejection_reason: null,
  created_at: "2026-08-09T10:00:00Z",
};

describe("library index submission schemas", () => {
  it("accepts the stable union returned by both registry workflows", () => {
    expect(libraryIndexSubmissionSchema.parse(item)).toMatchObject(item);
    expect(
      libraryIndexSubmissionSchema.parse({
        ...item,
        type: "guest",
        title: "باحث زائر",
        image_url: null,
        status: "approved",
        reviewed_at: "2026-08-09T12:00:00Z",
        reviewer: { id: 2, name: "المراجع" },
      }),
    ).toMatchObject({ type: "guest", status: "approved" });
  });

  it("validates Laravel pagination while tolerating additive response fields", () => {
    const parsed = libraryIndexSubmissionsResponseSchema.parse({
      data: [{ ...item, future_field: "ignored" }],
      links: { first: null, last: null, prev: null, next: null },
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 1,
        from: 1,
        to: 1,
      },
      filter_options: {
        types: [
          { value: "golden_visit", label: "السجل الذهبي" },
          { value: "guest", label: "سجل الضيوف" },
        ],
        statuses: ["pending", "approved", "rejected"],
      },
      stats: {
        total: 3,
        pending: 1,
        approved: 1,
        rejected: 1,
        by_type: {
          golden_visit: {
            total: 1,
            pending: 1,
            approved: 0,
            rejected: 0,
          },
          guest: { total: 2, pending: 0, approved: 1, rejected: 1 },
        },
      },
      future_meta: true,
    });
    expect(parsed.total).toBe(1);
    expect(parsed.stats.by_type.guest.total).toBe(2);
    expect(parsed.data[0]).not.toHaveProperty("future_field");
  });

  it("unwraps Laravel detail and action resource envelopes", () => {
    expect(
      libraryIndexSubmissionResponseSchema.parse({
        data: item,
        message: "تمت الموافقة",
      }),
    ).toMatchObject(item);
  });

  it("rejects unknown types, workflow states and malformed records", () => {
    expect(() =>
      libraryIndexSubmissionSchema.parse({ ...item, type: "subject" }),
    ).toThrow();
    expect(() =>
      libraryIndexSubmissionSchema.parse({ ...item, status: "published" }),
    ).toThrow();
    expect(() =>
      libraryIndexSubmissionSchema.parse({ ...item, name: "" }),
    ).toThrow();
  });
});
