import { afterEach, describe, expect, it, vi } from "vitest";

import { answerFatwaInbox, updateFatwaInboxAnswer } from "./fatwa-inbox.client";

afterEach(() => vi.unstubAllGlobals());

describe("fatwa inbox client payload", () => {
  it("omits public-only fields for a private email answer", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(Response.json({ success: true, data: { id: "8" } }));
    vi.stubGlobal("fetch", fetchMock);

    await answerFatwaInbox("8", {
      answer: "جواب خاص مكتمل.",
      question_title: "",
      category_id: "",
      visibility: "private",
      is_listed: false,
      notify_user: false,
      expected_updated_at: "2026-08-07T10:00:00Z",
    });

    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(body).toEqual({
      answer: "جواب خاص مكتمل.",
      visibility: "private",
    });
  });

  it("sends listing and notification choices for a public answer update", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(Response.json({ success: true, data: { id: "8" } }));
    vi.stubGlobal("fetch", fetchMock);

    await updateFatwaInboxAnswer("8", {
      answer: "جواب عام مكتمل.",
      question_title: "عنوان المسألة",
      category_id: "4",
      visibility: "public",
      is_listed: false,
      notify_user: true,
      expected_updated_at: "2026-08-07T10:00:00Z",
    });

    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(body).toMatchObject({
      category_id: "4",
      is_listed: false,
      notify_user: true,
      expected_updated_at: "2026-08-07T10:00:00Z",
    });
  });
});
