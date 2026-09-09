import { serverApiClient } from "@/core/api/server-api-client";
import {
  deleteTourGuideBff,
  getTourGuideBff,
  toTourGuidesHttpResponse,
  updateTourGuideBff,
} from "@/features/tour-guides/application/tour-guides-bff.core";
import {
  disabledTourGuidesResponse,
  invalidTourGuidesOriginResponse,
} from "@/features/tour-guides/application/tour-guides-bff.route";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function GET(
  request: Request,
  context: Context,
): Promise<Response> {
  const disabled = disabledTourGuidesResponse();
  if (disabled) return disabled;
  return toTourGuidesHttpResponse(
    await getTourGuideBff(
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
  const disabled = disabledTourGuidesResponse();
  if (disabled) return disabled;
  if (!isSameOriginMutation(request)) return invalidTourGuidesOriginResponse();
  return toTourGuidesHttpResponse(
    await updateTourGuideBff(
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
  const disabled = disabledTourGuidesResponse();
  if (disabled) return disabled;
  if (!isSameOriginMutation(request)) return invalidTourGuidesOriginResponse();
  return toTourGuidesHttpResponse(
    await deleteTourGuideBff(
      (await context.params).id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
