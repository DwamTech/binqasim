import { describe, expect, it } from "vitest";

import type {
  ListeningSeries,
  ListeningSession,
} from "../domain/listening.contracts";
import {
  filterWorkspaceSeries,
  filterWorkspaceSessions,
  resolveSeriesAfterDelete,
  resolveWorkspaceSeriesId,
  updateSeriesSessionCounts,
  upsertWorkspaceRecord,
} from "./listening-workspace.state";

const series: ListeningSeries[] = [
  {
    id: "1",
    slug: "bukhari",
    title: "صحيح البخاري",
    short_title: "البخاري",
    category: "الصحاح",
    description: "وصف",
    period_label: "١٤٤٦هـ",
    visual_variant: "gold",
    book_source_type: null,
    book_file_path: null,
    book_source_link: null,
    book_download_allowed: false,
    is_published: true,
    published_at: null,
    sessions_count: 2,
    published_sessions_count: 1,
  },
  {
    id: "2",
    slug: null,
    title: "سنن أبي داود",
    short_title: "أبو داود",
    category: "السنن",
    description: "وصف",
    period_label: "١٤٤٥هـ",
    visual_variant: "sage",
    book_source_type: null,
    book_file_path: null,
    book_source_link: null,
    book_download_allowed: false,
    is_published: false,
    published_at: null,
    sessions_count: 0,
    published_sessions_count: 0,
  },
];

const sessions = [
  {
    id: "10",
    listening_series_id: "1",
    slug: null,
    sequence_number: 1,
    title: "المجلس الأول",
    date_label: "١ محرم",
    duration_minutes: 40,
    description: "قراءة المقدمة",
    audio_source_type: null,
    audio_file_path: null,
    audio_source_link: null,
    audio_download_allowed: false,
    is_published: false,
    published_at: null,
  },
] satisfies ListeningSession[];

describe("listening workspace state", () => {
  it("resolves a deep-linked parent or falls back deterministically", () => {
    expect(resolveWorkspaceSeriesId(series, "2")).toBe("2");
    expect(resolveWorkspaceSeriesId(series, "missing")).toBe("1");
    expect(resolveWorkspaceSeriesId([], "1")).toBeNull();
  });

  it("keeps selection near a deleted parent", () => {
    expect(resolveSeriesAfterDelete(series, "1").selectedId).toBe("2");
    expect(resolveSeriesAfterDelete(series, "2").selectedId).toBe("1");
    const seriesWithThird = [
      ...series,
      { ...series[1]!, id: "3", title: "جامع الترمذي" },
    ];
    expect(resolveSeriesAfterDelete(seriesWithThird, "1", "3").selectedId).toBe(
      "3",
    );
  });

  it("filters Arabic parent and child records without changing source arrays", () => {
    expect(
      filterWorkspaceSeries(series, "أبو", "all").map(({ id }) => id),
    ).toEqual(["2"]);
    expect(filterWorkspaceSeries(series, "", "published")).toHaveLength(1);
    expect(filterWorkspaceSessions(sessions, "المقدمة", "draft")).toHaveLength(
      1,
    );
  });

  it("upserts records and keeps parent counters non-negative", () => {
    expect(
      upsertWorkspaceRecord<ListeningSeries>(series, {
        ...series[0]!,
        title: "محدث",
      })[0]?.title,
    ).toBe("محدث");
    expect(updateSeriesSessionCounts(series, "1", -5, -5)[0]).toMatchObject({
      sessions_count: 0,
      published_sessions_count: 0,
    });
  });
});
