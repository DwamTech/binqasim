import { serverApiClient } from "@/core/api/server-api-client";
import {
  createSection,
  listSections,
  toSectionsHttpResponse,
} from "@/features/sections/sections-bff.core";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  return toSectionsHttpResponse(
    await listSections(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}

export async function POST(request: Request): Promise<Response> {
  if (!isSameOriginMutation(request)) {
    return toSectionsHttpResponse({
      status: 403,
      body: {
        success: false,
        error: { code: "AUTH_FORBIDDEN", message: "Invalid request origin." },
      },
    });
  }
  return toSectionsHttpResponse(
    await createSection(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
