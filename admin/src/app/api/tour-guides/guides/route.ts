import { serverApiClient } from "@/core/api/server-api-client";
import {
  createTourGuideBff,
  listTourGuidesBff,
  toTourGuidesHttpResponse,
} from "@/features/tour-guides/application/tour-guides-bff.core";
import {
  disabledTourGuidesResponse,
  invalidTourGuidesOriginResponse,
} from "@/features/tour-guides/application/tour-guides-bff.route";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  const disabled = disabledTourGuidesResponse();
  if (disabled) return disabled;
  return toTourGuidesHttpResponse(
    await listTourGuidesBff(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}

export async function POST(request: Request): Promise<Response> {
  const disabled = disabledTourGuidesResponse();
  if (disabled) return disabled;
  if (!isSameOriginMutation(request)) return invalidTourGuidesOriginResponse();
  return toTourGuidesHttpResponse(
    await createTourGuideBff(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
