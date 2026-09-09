import { serverApiClient } from "@/core/api/server-api-client";
import {
  deleteSection,
  getSection,
  toSectionsHttpResponse,
  updateSection,
} from "@/features/sections/sections-bff.core";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export async function GET(
  request: Request,
  context: Context,
): Promise<Response> {
  const { id } = await context.params;
  return toSectionsHttpResponse(
    await getSection(
      id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}

export async function PATCH(
  request: Request,
  context: Context,
): Promise<Response> {
  if (!isSameOriginMutation(request)) {
    return toSectionsHttpResponse({
      status: 403,
      body: {
        success: false,
        error: { code: "AUTH_FORBIDDEN", message: "Invalid request origin." },
      },
    });
  }
  const { id } = await context.params;
  return toSectionsHttpResponse(
    await updateSection(
      request,
      id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}

export async function DELETE(
  request: Request,
  context: Context,
): Promise<Response> {
  if (!isSameOriginMutation(request)) {
    return toSectionsHttpResponse({
      status: 403,
      body: {
        success: false,
        error: { code: "AUTH_FORBIDDEN", message: "Invalid request origin." },
      },
    });
  }
  const { id } = await context.params;
  return toSectionsHttpResponse(
    await deleteSection(
      id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
