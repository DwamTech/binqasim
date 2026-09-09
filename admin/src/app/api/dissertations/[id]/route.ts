import { serverApiClient } from "@/core/api/server-api-client";
import {
  deleteDissertation,
  getDissertation,
  toDissertationsHttpResponse,
  updateDissertation,
} from "@/features/dissertations/application/dissertations-bff.core";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";
import { isDashboardModuleEnabled } from "@/server/dal/dashboard-module-guards";

export const runtime = "nodejs";
export const maxDuration = 120;

type Context = { params: Promise<{ id: string }> };

function disabledModuleResponse(): Response | null {
  return isDashboardModuleEnabled("dissertations")
    ? null
    : Response.json(
        {
          success: false,
          error: { code: "AUTH_FORBIDDEN", message: "Module is disabled." },
        },
        { status: 404, headers: { "cache-control": "no-store" } },
      );
}

export async function GET(
  request: Request,
  context: Context,
): Promise<Response> {
  const disabled = disabledModuleResponse();
  if (disabled) return disabled;
  return toDissertationsHttpResponse(
    await getDissertation(
      (await context.params).id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}

export async function PATCH(
  request: Request,
  context: Context,
): Promise<Response> {
  const disabled = disabledModuleResponse();
  if (disabled) return disabled;
  if (!isSameOriginMutation(request))
    return toDissertationsHttpResponse({
      status: 403,
      body: {
        success: false,
        error: { code: "AUTH_FORBIDDEN", message: "Invalid request origin." },
      },
    });
  return toDissertationsHttpResponse(
    await updateDissertation(
      (await context.params).id,
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}

export async function DELETE(
  request: Request,
  context: Context,
): Promise<Response> {
  const disabled = disabledModuleResponse();
  if (disabled) return disabled;
  if (!isSameOriginMutation(request))
    return toDissertationsHttpResponse({
      status: 403,
      body: {
        success: false,
        error: { code: "AUTH_FORBIDDEN", message: "Invalid request origin." },
      },
    });
  return toDissertationsHttpResponse(
    await deleteDissertation(
      (await context.params).id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
