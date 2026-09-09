import { describe, expect, it, vi } from "vitest";

import { apiFailure, apiSuccess } from "../../core/api/api-response";
import type { ServerApiClient } from "../../core/api/server-api-client.core";

import {
  getContact,
  getSiteStatus,
  getSupport,
  getSystemContent,
  updateContactFamily,
  updateSiteStatus,
  updateSupport,
  updateSupportBulk,
  updateSystemContent,
} from "./settings-bff.core";

const support = {
  site_status: "open",
  individual_support_enabled: true,
  institutional_support_enabled: false,
  module_articles_enabled: true,
  module_audios_enabled: true,
  module_listening_enabled: true,
  module_hadith_cards_enabled: true,
  module_visuals_enabled: true,
  module_scientific_videos_enabled: true,
  module_galleries_enabled: true,
  module_library_enabled: true,
  module_dissertations_enabled: true,
  module_scientific_fatwas_enabled: true,
  module_links_enabled: true,
};

function mockClient(...results: unknown[]) {
  const call = vi.fn();
  for (const result of results.length ? results : [apiSuccess({})])
    call.mockResolvedValueOnce(result);
  return {
    call,
    client: { request: call } as unknown as ServerApiClient,
  };
}

function jsonRequest(body: unknown): Request {
  return new Request("https://cms.test/api/settings", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("settings BFF", () => {
  it("forwards the token server-side to delegated Contact management", async () => {
    const { client, call } = mockClient(
      apiSuccess({
        id: "1",
        social: {},
        phones: {},
        business_details: {},
      }),
    );
    expect((await getContact(client, "private-token")).status).toBe(200);
    expect(call).toHaveBeenCalledWith(
      "/admin/site-contact",
      expect.objectContaining({ authorization: "Bearer private-token" }),
    );
    expect(
      JSON.stringify((await getContact(mockClient().client)).body),
    ).not.toContain("private-token");
  });

  it("forwards Contact family methods and payloads and rejects unknown families", async () => {
    const { client, call } = mockClient(
      apiSuccess({ success: true, message: "ok", data: {} }),
    );
    const result = await updateContactFamily(
      "phones",
      jsonRequest({
        support_phone: "+201000000000",
        management_phone: null,
        backup_phone: null,
      }),
      client,
      "token",
    );
    expect(result.status).toBe(200);
    expect(call).toHaveBeenCalledWith(
      "/admin/site-contact/phones",
      expect.objectContaining({
        method: "PUT",
        body: {
          support_phone: "+201000000000",
          management_phone: null,
          backup_phone: null,
        },
      }),
    );
    expect(
      (await updateContactFamily("secrets", jsonRequest({}), client, "token"))
        .status,
    ).toBe(404);
  });

  it("uses the admin-only endpoint for sensitive reads", async () => {
    const { client, call } = mockClient(apiSuccess(support));
    expect((await getSupport(client, "token")).status).toBe(200);
    expect(call).toHaveBeenCalledWith(
      "/admin/support/settings/update-all",
      expect.objectContaining({ authorization: "Bearer token" }),
    );
  });

  it("maps support booleans to Laravel strings for individual and bulk updates", async () => {
    const single = mockClient(apiSuccess({ message: "ok" }));
    await updateSupport(
      jsonRequest({ key: "module_articles_enabled", value: false }),
      single.client,
      "token",
    );
    expect(single.call).toHaveBeenCalledWith(
      "/admin/support/settings/update",
      expect.objectContaining({
        method: "POST",
        body: { key: "module_articles_enabled", value: "false" },
      }),
    );

    const bulk = mockClient(apiSuccess({ message: "ok" }));
    await updateSupportBulk(jsonRequest({ value: true }), bulk.client, "token");
    expect(bulk.call).toHaveBeenCalledWith(
      "/admin/support/settings/update-all",
      expect.objectContaining({ body: { value: "true" } }),
    );
  });

  it("reads status through an admin probe and forwards confirmed updates", async () => {
    const read = mockClient(apiSuccess({ ...support, site_status: "closed" }));
    expect(await getSiteStatus(read.client, "token")).toMatchObject({
      status: 200,
      body: { success: true, data: { status: "closed" } },
    });
    const write = mockClient(
      apiSuccess({ message: "updated", status: "open" }),
    );
    await updateSiteStatus(
      jsonRequest({ status: "open" }),
      write.client,
      "token",
    );
    expect(write.call).toHaveBeenCalledWith(
      "/admin/site/status",
      expect.objectContaining({ method: "POST", body: { status: "open" } }),
    );
  });

  it("allowlists content keys and admin-authorizes before public reads", async () => {
    const { client, call } = mockClient(
      apiSuccess(support),
      apiSuccess({ key: "about_waqf", content: "<p>About</p>" }),
    );
    expect((await getSystemContent("about_waqf", client, "token")).status).toBe(
      200,
    );
    expect(call.mock.calls.map(([endpoint]) => endpoint)).toEqual([
      "/admin/support/settings/update-all",
      "/system-content/about_waqf",
    ]);
    const unknown = mockClient();
    expect(
      (await getSystemContent("../secret", unknown.client, "token")).status,
    ).toBe(404);
    expect(unknown.call).not.toHaveBeenCalled();
  });

  it("updates supported content without interpreting HTML", async () => {
    const { client, call } = mockClient(
      apiSuccess({
        message: "ok",
        data: { key: "about_waqf", content: "<script>plain text</script>" },
      }),
    );
    await updateSystemContent(
      "about_waqf",
      jsonRequest({ content: "<script>plain text</script>" }),
      client,
      "token",
    );
    expect(call).toHaveBeenCalledWith(
      "/admin/system-content/about_waqf",
      expect.objectContaining({
        method: "POST",
        body: { content: "<script>plain text</script>" },
      }),
    );
  });

  it("preserves 401, 403, 404, 422, and 500 without leaking backend detail", async () => {
    expect((await getSupport(mockClient().client)).status).toBe(401);
    expect(
      (
        await getSupport(
          mockClient(apiFailure("AUTH_FORBIDDEN", { status: 403 })).client,
          "token",
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await updateSiteStatus(
          jsonRequest({ status: "broken" }),
          mockClient().client,
          "token",
        )
      ).status,
    ).toBe(422);
    expect(
      (
        await getSupport(
          mockClient(apiFailure("BACKEND_UNAVAILABLE", { status: 500 })).client,
          "token",
        )
      ).status,
    ).toBe(500);
  });
});
