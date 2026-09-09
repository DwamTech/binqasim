import { describe, expect, it, vi } from "vitest";

import { apiFailure, apiSuccess } from "../../core/api/api-response";
import type { ServerApiClient } from "../../core/api/server-api-client.core";
import {
  createSection,
  deleteSection,
  getSection,
  listSections,
  updateSection,
} from "./sections-bff.core";

const section = {
  id: "1",
  name: "News",
  slug: "news",
  module: "articles",
  description: null,
  is_active: true,
};

function mockClient(result: unknown = apiSuccess({})) {
  const call = vi.fn().mockResolvedValue(result);
  return {
    call,
    client: { request: call } as unknown as ServerApiClient,
  };
}

function jsonRequest(url: string, body: unknown): Request {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("sections BFF", () => {
  it("forwards normalized search, module, and page to the management list", async () => {
    const backendPage = {
      current_page: 2,
      data: [section],
      last_page: 3,
      per_page: 20,
      total: 42,
    };
    const { client, call } = mockClient(apiSuccess(backendPage));
    const result = await listSections(
      new Request(
        "https://cms.test/api/sections?search=news&module=articles&page=2",
      ),
      client,
      "private-token",
    );

    expect(result.status).toBe(200);
    expect(call).toHaveBeenCalledWith(
      "/admin/sections",
      expect.objectContaining({
        authorization: "Bearer private-token",
        query: { search: "news", module: "articles", page: 2 },
      }),
    );
  });

  it("does not call Laravel without a session or for malformed query and IDs", async () => {
    const { client, call } = mockClient();
    expect(
      (await listSections(new Request("https://cms.test/api/sections"), client))
        .status,
    ).toBe(401);
    expect(
      (
        await listSections(
          new Request("https://cms.test/api/sections?module=invalid"),
          client,
          "token",
        )
      ).status,
    ).toBe(422);
    expect((await getSection("../1", client, "token")).status).toBe(422);
    expect(call).not.toHaveBeenCalled();
  });

  it("returns inactive management detail without filtering it client-side", async () => {
    const inactiveSection = { ...section, is_active: false };
    const { client, call } = mockClient(apiSuccess(inactiveSection));
    const result = await getSection("1", client, "token");

    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({
      success: true,
      data: { id: "1", is_active: false },
    });
    expect(call).toHaveBeenCalledWith(
      "/admin/sections/1",
      expect.objectContaining({ authorization: "Bearer token" }),
    );
  });

  it("creates only an approved module-scoped section", async () => {
    const { client, call } = mockClient(
      apiSuccess({ message: "created", section }),
    );
    const result = await createSection(
      jsonRequest("https://cms.test/api/sections", {
        name: " News ",
        module: "articles",
        description: "",
        is_active: true,
      }),
      client,
      "token",
    );

    expect(result.status).toBe(201);
    expect(call).toHaveBeenCalledWith(
      "/admin/sections",
      expect.objectContaining({
        method: "POST",
        body: {
          name: "News",
          module: "articles",
          description: "",
          is_active: true,
        },
      }),
    );
  });

  it.each(["galleries", "gallery_media", "unknown"])(
    "rejects non-UI module %s before Laravel",
    async (module) => {
      const { client, call } = mockClient();
      const result = await createSection(
        jsonRequest("https://cms.test/api/sections", {
          name: "Hidden",
          module,
          description: null,
          is_active: true,
        }),
        client,
        "token",
      );
      expect(result.status).toBe(422);
      expect(call).not.toHaveBeenCalled();
    },
  );

  it("uses PATCH for edit and preserves backend validation failures", async () => {
    const { client, call } = mockClient(
      apiFailure("VALIDATION_FAILED", {
        status: 422,
        fieldErrors: { name: ["duplicate"] },
      }),
    );
    const result = await updateSection(
      jsonRequest("https://cms.test/api/sections/1", {
        name: "News",
        module: "articles",
        description: null,
        is_active: false,
      }),
      "1",
      client,
      "token",
    );
    expect(result.status).toBe(422);
    expect(call).toHaveBeenCalledWith(
      "/admin/sections/1",
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(result.body).toMatchObject({
      success: false,
      error: { fieldErrors: { name: ["duplicate"] } },
    });
  });

  it("preserves delete conflict as a first-class 409", async () => {
    const { client } = mockClient(apiFailure("UNKNOWN_ERROR", { status: 409 }));
    const result = await deleteSection("1", client, "token");
    expect(result.status).toBe(409);
  });

  it("keeps module isolation in returned list contracts", async () => {
    for (const moduleValue of ["articles", "books", "visuals"] as const) {
      const moduleSection = { ...section, module: moduleValue };
      const { client } = mockClient(
        apiSuccess({
          current_page: 1,
          data: [moduleSection],
          last_page: 1,
          per_page: 20,
          total: 1,
        }),
      );
      const result = await listSections(
        new Request(`https://cms.test/api/sections?module=${moduleValue}`),
        client,
        "token",
      );
      expect(result.body).toMatchObject({
        success: true,
        data: { data: [{ module: moduleValue }] },
      });
    }
  });
});
