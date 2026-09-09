import { describe, expect, it } from "vitest";

import {
  emptyListeningSeriesForm,
  emptyListeningSessionForm,
} from "../domain/listening.contracts";
import {
  createListeningSeriesFormData,
  createListeningSessionFormData,
  validateListeningSeriesForm,
  validateListeningSessionForm,
} from "./listening.form";

const seriesValues = {
  ...emptyListeningSeriesForm,
  title: "سلسلة صحيح البخاري",
  short_title: "صحيح البخاري",
  category: "كتب الصحاح",
  period_label: "١٤٤٦هـ",
  description: "وصف السلسلة",
};

const sessionValues = {
  ...emptyListeningSessionForm,
  listening_series_id: "7",
  sequence_number: "1",
  title: "المجلس الأول",
  date_label: "١ محرم ١٤٤٦هـ",
  duration_minutes: "45",
  description: "وصف المجلس",
};

describe("listening form contracts", () => {
  it("creates a valid draft series with backend-safe defaults", () => {
    expect(validateListeningSeriesForm(seriesValues, {})).toEqual({});
    const body = createListeningSeriesFormData(seriesValues, {});
    expect(body.get("visual_variant")).toBe("gold");
    expect(body.get("book_source_type")).toBe("");
    expect(body.get("is_published")).toBe("0");
  });

  it("allows a draft session without audio but blocks publishing it", () => {
    expect(validateListeningSessionForm(sessionValues, {})).toEqual({});
    expect(
      validateListeningSessionForm(
        { ...sessionValues, is_published: true },
        {},
      ),
    ).toHaveProperty("audio_source_type");
  });

  it("does not append a stale file after switching source away from file", () => {
    const book = new File(["book"], "book.pdf", { type: "application/pdf" });
    const audio = new File(["audio"], "session.mp3", { type: "audio/mpeg" });
    expect(
      createListeningSeriesFormData(
        { ...seriesValues, book_source_type: "none" },
        { book_file: book },
      ).has("book_file"),
    ).toBe(false);
    expect(
      createListeningSessionFormData(
        { ...sessionValues, audio_source_type: "none" },
        { audio_file: audio },
      ).has("audio_file"),
    ).toBe(false);
  });

  it("accepts only a direct HTTPS audio file as an external recording source", () => {
    expect(
      validateListeningSessionForm(
        {
          ...sessionValues,
          audio_source_type: "link",
          audio_source_link:
            "https://cdn.example.test/audio/session.mp3?signature=temporary",
        },
        {},
      ),
    ).toEqual({});

    for (const audio_source_link of [
      "https://example.test/listen",
      "https://www.youtube.com/watch?v=example",
      "http://cdn.example.test/audio/session.mp3",
      "https://example.test/audio/session.pdf",
    ]) {
      expect(
        validateListeningSessionForm(
          { ...sessionValues, audio_source_type: "link", audio_source_link },
          {},
        ),
      ).toHaveProperty("audio_source_link");
    }
  });
});
