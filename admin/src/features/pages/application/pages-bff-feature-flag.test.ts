import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const forwarded = () =>
    vi.fn().mockResolvedValue({
      status: 200,
      body: { success: true, data: {} },
    });

  return {
    moduleDisabledResponse: vi.fn(),
    authContext: vi.fn(() => ({ token: "private-token" })),
    sameOrigin: vi.fn(() => true),
    backendRequest: vi.fn(),
    listPages: forwarded(),
    createPage: forwarded(),
    deletePage: forwarded(),
    getPage: forwarded(),
    saveDraft: forwarded(),
    uploadMedia: forwarded(),
    createPreview: forwarded(),
    revokePreview: forwarded(),
    lifecycle: forwarded(),
    listRevisions: forwarded(),
    getRevision: forwarded(),
    restoreRevision: forwarded(),
    toResponse: vi.fn((result: { status: number; body: object }) =>
      result.status === 204
        ? new Response(null, { status: 204 })
        : Response.json(result.body, { status: result.status }),
    ),
  };
});

vi.mock("server-only", () => ({}));
vi.mock("@/core/api/server-api-client", () => ({
  serverApiClient: { request: mocks.backendRequest },
}));
vi.mock("@/features/pages/application/pages-module-guard", () => ({
  pagesModuleDisabledResponse: mocks.moduleDisabledResponse,
}));
vi.mock("@/server/auth-bff/route-context", () => ({
  createAuthBffRequestContext: mocks.authContext,
}));
vi.mock("@/server/security/same-origin-request", () => ({
  isSameOriginMutation: mocks.sameOrigin,
}));
vi.mock("@/features/pages/application/pages-bff.core", () => ({
  listPages: mocks.listPages,
  createPage: mocks.createPage,
  deletePage: mocks.deletePage,
  getPage: mocks.getPage,
  saveDraft: mocks.saveDraft,
  uploadMedia: mocks.uploadMedia,
  createPreview: mocks.createPreview,
  revokePreview: mocks.revokePreview,
  lifecycle: mocks.lifecycle,
  listRevisions: mocks.listRevisions,
  getRevision: mocks.getRevision,
  restoreRevision: mocks.restoreRevision,
  toPagesHttpResponse: mocks.toResponse,
}));

import * as archiveRoute from "@/app/api/pages/[id]/archive/route";
import * as draftRoute from "@/app/api/pages/[id]/draft/route";
import * as mediaRoute from "@/app/api/pages/[id]/media/route";
import * as previewRoute from "@/app/api/pages/[id]/preview/route";
import * as publishRoute from "@/app/api/pages/[id]/publish/route";
import * as restoreLifecycleRoute from "@/app/api/pages/[id]/restore-from-archive/route";
import * as restoreRevisionRoute from "@/app/api/pages/[id]/revisions/[revisionId]/restore/route";
import * as revisionDetailRoute from "@/app/api/pages/[id]/revisions/[revisionId]/route";
import * as revisionListRoute from "@/app/api/pages/[id]/revisions/route";
import * as detailRoute from "@/app/api/pages/[id]/route";
import * as collectionRoute from "@/app/api/pages/route";

type Handler = { name: string; run: () => Promise<Response> };

const pageContext = { params: Promise.resolve({ id: "1" }) };
const revisionContext = {
  params: Promise.resolve({ id: "1", revisionId: "2" }),
};

function request(method: string, path: string): Request {
  return new Request(`https://dashboard.test${path}`, {
    method,
    headers: {
      origin: "https://dashboard.test",
      "content-type": "application/json",
    },
    ...(method === "GET" ? {} : { body: "{}" }),
  });
}

function handlers(): Handler[] {
  return [
    {
      name: "list",
      run: () => collectionRoute.GET(request("GET", "/api/pages")),
    },
    {
      name: "create",
      run: () => collectionRoute.POST(request("POST", "/api/pages")),
    },
    {
      name: "detail",
      run: () => detailRoute.GET(request("GET", "/api/pages/1"), pageContext),
    },
    {
      name: "delete",
      run: () =>
        detailRoute.DELETE(request("DELETE", "/api/pages/1"), pageContext),
    },
    {
      name: "draft",
      run: () =>
        draftRoute.PUT(request("PUT", "/api/pages/1/draft"), pageContext),
    },
    {
      name: "media",
      run: () =>
        mediaRoute.POST(request("POST", "/api/pages/1/media"), pageContext),
    },
    {
      name: "preview-create",
      run: () =>
        previewRoute.POST(
          request("POST", "/api/pages/1/preview"),
          pageContext,
        ),
    },
    {
      name: "preview-revoke",
      run: () =>
        previewRoute.DELETE(
          request("DELETE", "/api/pages/1/preview"),
          pageContext,
        ),
    },
    {
      name: "publish",
      run: () =>
        publishRoute.POST(
          request("POST", "/api/pages/1/publish"),
          pageContext,
        ),
    },
    {
      name: "archive",
      run: () =>
        archiveRoute.POST(
          request("POST", "/api/pages/1/archive"),
          pageContext,
        ),
    },
    {
      name: "lifecycle-restore",
      run: () =>
        restoreLifecycleRoute.POST(
          request("POST", "/api/pages/1/restore-from-archive"),
          pageContext,
        ),
    },
    {
      name: "revision-list",
      run: () =>
        revisionListRoute.GET(
          request("GET", "/api/pages/1/revisions"),
          pageContext,
        ),
    },
    {
      name: "revision-detail",
      run: () =>
        revisionDetailRoute.GET(
          request("GET", "/api/pages/1/revisions/2"),
          revisionContext,
        ),
    },
    {
      name: "revision-restore",
      run: () =>
        restoreRevisionRoute.POST(
          request("POST", "/api/pages/1/revisions/2/restore"),
          revisionContext,
        ),
    },
  ];
}

const forwardingMocks = [
  mocks.listPages,
  mocks.createPage,
  mocks.deletePage,
  mocks.getPage,
  mocks.saveDraft,
  mocks.uploadMedia,
  mocks.createPreview,
  mocks.revokePreview,
  mocks.lifecycle,
  mocks.listRevisions,
  mocks.getRevision,
  mocks.restoreRevision,
];

describe("Pages BFF feature flag", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.sameOrigin.mockReturnValue(true);
  });

  it("blocks every read, mutation, workflow, revision, and multipart handler before forwarding", async () => {
    mocks.moduleDisabledResponse.mockImplementation(() =>
      Response.json(
        {
          success: false,
          error: { code: "AUTH_FORBIDDEN", message: "Module is disabled." },
        },
        { status: 404, headers: { "cache-control": "no-store" } },
      ),
    );

    for (const handler of handlers()) {
      const response = await handler.run();
      expect(response.status, handler.name).toBe(404);
      expect(response.headers.get("cache-control"), handler.name).toBe(
        "no-store",
      );
    }

    expect(mocks.moduleDisabledResponse).toHaveBeenCalledTimes(14);
    for (const forward of forwardingMocks) expect(forward).not.toHaveBeenCalled();
    expect(mocks.backendRequest).not.toHaveBeenCalled();
    expect(mocks.authContext).not.toHaveBeenCalled();
    expect(mocks.sameOrigin).not.toHaveBeenCalled();
  });

  it("preserves every enabled route flow, auth forwarding, and workflow mapping", async () => {
    mocks.moduleDisabledResponse.mockReturnValue(null);

    for (const handler of handlers()) {
      expect((await handler.run()).status, handler.name).toBe(200);
    }

    expect(mocks.moduleDisabledResponse).toHaveBeenCalledTimes(14);
    expect(mocks.authContext).toHaveBeenCalledTimes(14);
    expect(mocks.sameOrigin).toHaveBeenCalledTimes(10);
    expect(mocks.listPages).toHaveBeenCalledOnce();
    expect(mocks.createPage).toHaveBeenCalledOnce();
    expect(mocks.deletePage).toHaveBeenCalledOnce();
    expect(mocks.getPage).toHaveBeenCalledOnce();
    expect(mocks.saveDraft).toHaveBeenCalledOnce();
    expect(mocks.uploadMedia).toHaveBeenCalledOnce();
    expect(mocks.createPreview).toHaveBeenCalledOnce();
    expect(mocks.revokePreview).toHaveBeenCalledOnce();
    expect(mocks.lifecycle).toHaveBeenCalledTimes(3);
    expect(mocks.lifecycle).toHaveBeenNthCalledWith(
      1,
      "1",
      "publish",
      expect.anything(),
      "private-token",
    );
    expect(mocks.lifecycle).toHaveBeenNthCalledWith(
      2,
      "1",
      "archive",
      expect.anything(),
      "private-token",
    );
    expect(mocks.lifecycle).toHaveBeenNthCalledWith(
      3,
      "1",
      "restore-from-archive",
      expect.anything(),
      "private-token",
    );
    expect(mocks.listRevisions).toHaveBeenCalledOnce();
    expect(mocks.getRevision).toHaveBeenCalledOnce();
    expect(mocks.restoreRevision).toHaveBeenCalledOnce();
  });

  it("keeps same-origin rejection ahead of auth and forwarding while enabled", async () => {
    mocks.moduleDisabledResponse.mockReturnValue(null);
    mocks.sameOrigin.mockReturnValue(false);

    const response = await collectionRoute.POST(request("POST", "/api/pages"));

    expect(response.status).toBe(403);
    expect(mocks.sameOrigin).toHaveBeenCalledOnce();
    expect(mocks.authContext).not.toHaveBeenCalled();
    expect(mocks.createPage).not.toHaveBeenCalled();
  });
});
