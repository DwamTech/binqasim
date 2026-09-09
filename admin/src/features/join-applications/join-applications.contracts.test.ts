import { describe, expect, it } from "vitest";
import {
  isJoinApplicationType,
  joinApplicationPageSchema,
  joinApplicationSchema,
  joinApplicationStatuses,
} from "./join-applications.contracts";

export const joinApplicationFixture = {
  id: 1,
  request_number: "MEM-20260730-A1B2",
  status: "new" as const,
  admin_note: null,
  reviewed_at: null,
  created_at: "2026-07-30T10:00:00Z",
  updated_at: "2026-07-30T10:00:00Z",
  full_name: "أحمد محمد",
  national_id: "1098765432",
  account_username: "member.user",
  attachments: [],
  reviewer: null,
};

describe("join applications contracts", () => {
  it("recognizes only the four supported application types", () => {
    expect(
      ["members", "volunteers", "guides", "jobs"].every(isJoinApplicationType),
    ).toBe(true);
    expect(isJoinApplicationType("feedback")).toBe(false);
    expect(joinApplicationStatuses).toHaveLength(6);
  });

  it("parses application detail and paginator responses", () => {
    expect(
      joinApplicationSchema.parse(joinApplicationFixture).request_number,
    ).toBe("MEM-20260730-A1B2");
    expect(joinApplicationSchema.parse(joinApplicationFixture)).not.toHaveProperty(
      "password_hash",
    );
    expect(
      joinApplicationPageSchema.parse({
        data: [joinApplicationFixture],
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 1,
      }).total,
    ).toBe(1);
  });
});
