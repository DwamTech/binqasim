import { describe, expect, it, vi } from "vitest";
import { apiSuccess } from "@/core/api/api-response";
import type { ServerApiClient } from "@/core/api/server-api-client.core";
import {
  deleteJoinApplication,
  listJoinApplications,
  saveJoinApplication,
  updateJoinApplicationStatus,
} from "./join-applications-bff.core";
import { joinApplicationFixture } from "./join-applications.contracts.test";

function mockClient(result: unknown = apiSuccess(joinApplicationFixture)) {
  const call = vi.fn().mockResolvedValue(result);
  return {
    call,
    client: { request: call } as unknown as ServerApiClient,
  };
}

describe("join applications BFF", () => {
  it("forwards validated filters and server-side authorization", async () => {
    const { client, call } = mockClient(
      apiSuccess({
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
      }),
    );
    await listJoinApplications(
      "members",
      new Request(
        "https://cms.test/api/join-applications/members?status=new&search=MEM&page=2",
      ),
      client,
      "private-token",
    );
    expect(call).toHaveBeenCalledWith(
      "/admin/join-applications/members",
      expect.objectContaining({
        authorization: "Bearer private-token",
        query: expect.objectContaining({
          status: "new",
          search: "MEM",
          page: 2,
        }),
      }),
    );
  });

  it("rejects unsupported types, invalid status, and missing sessions", async () => {
    const { client, call } = mockClient();
    expect(
      (
        await listJoinApplications(
          "feedback",
          new Request("https://cms.test/api/join-applications/feedback"),
          client,
          "token",
        )
      ).status,
    ).toBe(404);
    expect(
      (
        await updateJoinApplicationStatus(
          "members",
          "1",
          new Request("https://cms.test", {
            method: "PATCH",
            body: JSON.stringify({ status: "unknown" }),
          }),
          client,
          "token",
        )
      ).status,
    ).toBe(422);
    expect((await deleteJoinApplication("members", "1", client)).status).toBe(
      401,
    );
    expect(call).not.toHaveBeenCalled();
  });

  it("uses multipart method override for editing and confirmed status/delete paths", async () => {
    const { client, call } = mockClient();
    const formData = new FormData();
    formData.set("city", "جدة");
    await saveJoinApplication(
      "members",
      "1",
      new Request("https://cms.test", { method: "PATCH", body: formData }),
      client,
      "token",
    );
    expect(call).toHaveBeenCalledWith(
      "/admin/join-applications/members/1",
      expect.objectContaining({
        method: "POST",
        multipartMethodOverride: "PATCH",
        authorization: "Bearer token",
      }),
    );

    await updateJoinApplicationStatus(
      "jobs",
      "2",
      new Request("https://cms.test", {
        method: "PATCH",
        body: JSON.stringify({ status: "accepted" }),
      }),
      client,
      "token",
    );
    expect(call).toHaveBeenLastCalledWith(
      "/admin/join-applications/jobs/2/status",
      expect.objectContaining({ method: "PATCH" }),
    );

    await deleteJoinApplication("guides", "3", client, "token");
    expect(call).toHaveBeenLastCalledWith(
      "/admin/join-applications/guides/3",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
