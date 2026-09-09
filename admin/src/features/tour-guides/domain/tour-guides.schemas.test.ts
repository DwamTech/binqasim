import { describe, expect, it } from "vitest";

import {
  tourGuideScalarSchema,
  tourRequestResourceSchema,
} from "./tour-guides.schemas";

const guide = {
  id: 8,
  slug: "sara-alotaibi",
  name: "سارة العتيبي",
  title: "مرشدة سياحية معتمدة",
  bio: "متخصصة في المسارات التاريخية.",
  experience_years: 7,
  languages: ["العربية", "English"],
  tour_routes: ["جدة التاريخية"],
  photo_url: "https://example.test/sara.webp",
  is_active: true,
  is_archived: false,
  display_order: 1,
  license_number: "TG-100",
  phone: "+966500000000",
  email: "sara@example.test",
  created_at: "2026-08-22T08:00:00.000Z",
  updated_at: "2026-08-22T08:00:00.000Z",
};

describe("tour guides schemas", () => {
  it("normalizes the admin request resource including privacy and status history", () => {
    const result = tourRequestResourceSchema.parse({
      data: {
        id: 21,
        reference: "TR-2026-000021",
        guide,
        full_name: "أحمد محمد",
        phone: "+966511111111",
        email: "visitor@example.test",
        tour_route: "جدة التاريخية",
        tour_goal: "التعرف على تاريخ المنطقة",
        visitor_type: "individual",
        preferred_date: "2026-09-12",
        preferred_time: "10:30",
        participants_count: 2,
        status: "in_progress",
        admin_note: "تم تأكيد الموعد",
        privacy_accepted_at: "2026-08-22T08:00:00.000Z",
        status_history: [
          {
            id: 33,
            from_status: "new",
            to_status: "in_progress",
            note: "تم التواصل",
            changed_by: { id: 4, name: "مدير الرحلات" },
            created_at: "2026-08-22T09:00:00.000Z",
          },
        ],
        created_at: "2026-08-22T08:00:00.000Z",
        updated_at: "2026-08-22T09:00:00.000Z",
      },
    });

    expect(result.privacy_accepted_at).toBe("2026-08-22T08:00:00.000Z");
    expect(result.status_history[0]).toMatchObject({
      id: "33",
      fromStatus: "new",
      toStatus: "in_progress",
      note: "تم التواصل",
      actor: { id: "4", name: "مدير الرحلات" },
    });
  });

  it("requires history identifiers and enforces backend guide limits", () => {
    const values = {
      name: "مرشد سياحي",
      slug: "valid-guide",
      title: "مرشد معتمد",
      bio: "",
      experience_years: "5",
      languages: ["العربية"],
      tour_routes: ["المسار التاريخي"],
      is_active: "1",
      display_order: "0",
      license_number: "TG-1",
      phone: "+966500000000",
      email: "guide@example.test",
    };

    expect(tourGuideScalarSchema.safeParse(values).success).toBe(true);
    expect(
      tourGuideScalarSchema.safeParse({ ...values, slug: "x".repeat(161) })
        .success,
    ).toBe(false);
    expect(
      tourRequestResourceSchema.safeParse({
        data: {
          id: 1,
          reference: "TR-1",
          guide,
          full_name: "زائر",
          phone: "+966500000000",
          email: "visitor@example.test",
          tour_route: "مسار",
          tour_goal: "هدف",
          visitor_type: "individual",
          preferred_date: null,
          preferred_time: null,
          participants_count: 1,
          status: "new",
          admin_note: null,
          privacy_accepted_at: null,
          status_history: [{ to_status: "new" }],
          created_at: null,
          updated_at: null,
        },
      }).success,
    ).toBe(false);
  });
});
