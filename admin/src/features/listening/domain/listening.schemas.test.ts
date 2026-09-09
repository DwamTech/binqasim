import { describe, expect, it } from "vitest";

import {
  listeningSeriesDetailSchema,
  listeningSeriesPageSchema,
  listeningSessionDetailSchema,
  listeningSessionPageSchema,
} from "./listening.schemas";

const series = {
  id: 7,
  slug: null,
  title: "سلسلة صحيح البخاري",
  short_title: "صحيح البخاري",
  category: "كتب الصحاح",
  description: "وصف السلسلة",
  period_label: "١٤٤٦هـ",
  visual_variant: "gold",
  book_source_type: null,
  book_file_path: null,
  book_file_url: null,
  book_source_link: null,
  book_url: null,
  book_download_allowed: 0,
  is_published: 0,
  published_at: null,
  sessions_count: 1,
  published_sessions_count: 0,
};

const session = {
  id: 11,
  listening_series_id: 7,
  series: {
    id: 7,
    slug: null,
    title: series.title,
    short_title: series.short_title,
    category: series.category,
  },
  slug: "المجلس-الأول",
  sequence_number: 1,
  title: "المجلس الأول",
  date_label: "١ محرم ١٤٤٦هـ",
  duration_minutes: 45,
  description: "وصف المجلس",
  audio_source_type: null,
  audio_file_path: null,
  audio_file_url: null,
  audio_source_link: null,
  audio_url: null,
  audio_download_allowed: false,
  is_published: false,
  published_at: null,
};

describe("listening runtime contracts", () => {
  it("parses Laravel resource details including nullable generated slugs", () => {
    expect(
      listeningSeriesDetailSchema.parse({
        data: { ...series, sessions: [session] },
      }),
    ).toMatchObject({
      id: "7",
      slug: null,
      is_published: false,
      sessions: [{ id: "11", sequence_number: 1 }],
    });
    expect(listeningSessionDetailSchema.parse({ data: session })).toMatchObject(
      {
        id: "11",
        listening_series_id: "7",
        duration_minutes: 45,
      },
    );
  });

  it("normalizes both Laravel paginators and their admin stats", () => {
    const meta = { current_page: 1, last_page: 1, per_page: 20, total: 1 };
    const seriesPage = listeningSeriesPageSchema.parse({
      data: [series],
      links: {},
      meta,
      filter_options: {
        categories: [series.category],
        visual_variants: ["gold"],
      },
      stats: { total_series: 1, published_series: 0, draft_series: 1 },
    });
    const sessionPage = listeningSessionPageSchema.parse({
      data: [session],
      links: {},
      meta,
      filter_options: {
        series: [session.series],
        categories: [series.category],
      },
      stats: {
        total_sessions: 1,
        published_sessions: 0,
        draft_sessions: 1,
      },
    });

    expect(seriesPage.stats).toEqual({ total: 1, published: 0, drafts: 1 });
    expect(sessionPage.filter_options.series[0]?.id).toBe("7");
    expect(sessionPage.stats.drafts).toBe(1);
  });
});
