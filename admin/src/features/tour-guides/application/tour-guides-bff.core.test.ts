import { describe, expect, it, vi } from "vitest";

import { apiSuccess } from "@/core/api/api-response";
import type { ServerApiClient } from "@/core/api/server-api-client.core";

import {
  createTourGuideBff,
  listTourGuidesBff,
  updateTourGuideBff,
  updateTourRequestStatusBff,
} from "./tour-guides-bff.core";

function mockClient() {
  const call = vi.fn().mockResolvedValue(apiSuccess({}));
  return { call, client: { request: call } as unknown as ServerApiClient };
}

function guideForm(includePhoto = false): FormData {
  const form = new FormData();
  form.set("name", "سارة العتيبي");
  form.set("slug", "sara-alotaibi");
  form.set("title", "مرشدة سياحية معتمدة");
  form.set("bio", "خبرة في المسارات التاريخية.");
  form.set("experience_years", "7");
  form.append("languages[]", "العربية");
  form.append("tour_routes[]", "جدة التاريخية");
  form.set("is_active", "1");
  form.set("display_order", "1");
  form.set("license_number", "TG-100");
  form.set("phone", "+966500000000");
  form.set("email", "sara@example.test");
  if (includePhoto)
    form.set(
      "photo",
      new File([new Uint8Array([1, 2, 3])], "sara.jpg", {
        type: "image/jpeg",
      }),
    );
  return form;
}

describe("tour guides dashboard BFF", () => {
  it("allowlists and forwards guide list filters", async () => {
    const { call, client } = mockClient();
    const result = await listTourGuidesBff(
      new Request(
        "https://dashboard.test/api/tour-guides/guides?search=سارة&is_active=true&page=2&per_page=20&unsafe=ignored",
      ),
      client,
      "private-token",
    );

    expect(result.status).toBe(200);
    expect(call).toHaveBeenCalledWith(
      "/admin/tour-guides",
      expect.objectContaining({
        authorization: "Bearer private-token",
        query: { search: "سارة", is_active: 1, page: 2, per_page: 20 },
      }),
    );
  });

  it("requires a photo on create and uses Laravel multipart override on edit", async () => {
    const { call, client } = mockClient();
    const createWithoutPhoto = await createTourGuideBff(
      new Request("https://dashboard.test/api/tour-guides/guides", {
        method: "POST",
        body: guideForm(),
      }),
      client,
      "token",
    );
    expect(createWithoutPhoto.status).toBe(422);
    expect(call).not.toHaveBeenCalled();

    await updateTourGuideBff(
      "8",
      new Request("https://dashboard.test/api/tour-guides/guides/8", {
        method: "PATCH",
        body: guideForm(),
      }),
      client,
      "token",
    );
    expect(call).toHaveBeenCalledWith(
      "/admin/tour-guides/8",
      expect.objectContaining({
        method: "PATCH",
        multipartMethodOverride: "PATCH",
        authorization: "Bearer token",
        body: expect.any(FormData),
      }),
    );
  });

  it("validates request IDs and status bodies before forwarding", async () => {
    const { call, client } = mockClient();
    const validRequest = new Request(
      "https://dashboard.test/api/tour-guides/requests/14/status",
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status: "in_progress",
          admin_note: "تم التواصل مع المرشد",
        }),
      },
    );
    await updateTourRequestStatusBff("14", validRequest, client, "token");
    expect(call).toHaveBeenCalledWith(
      "/admin/tour-requests/14/status",
      expect.objectContaining({
        method: "PATCH",
        authorization: "Bearer token",
        body: {
          status: "in_progress",
          admin_note: "تم التواصل مع المرشد",
        },
      }),
    );

    expect(
      (await updateTourRequestStatusBff("../14", validRequest, client, "token"))
        .status,
    ).toBe(404);
    expect(
      (
        await updateTourRequestStatusBff(
          "14",
          new Request("https://dashboard.test/api/status", {
            method: "PATCH",
            body: JSON.stringify({ status: "unknown" }),
          }),
          client,
          "token",
        )
      ).status,
    ).toBe(422);
    expect(call).toHaveBeenCalledTimes(1);
  });
});
