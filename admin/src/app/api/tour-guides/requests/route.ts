import { serverApiClient } from "@/core/api/server-api-client";
import {
  listTourRequestsBff,
  toTourGuidesHttpResponse,
} from "@/features/tour-guides/application/tour-guides-bff.core";
import { disabledTourGuidesResponse } from "@/features/tour-guides/application/tour-guides-bff.route";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  const disabled = disabledTourGuidesResponse();
  if (disabled) return disabled;
  return toTourGuidesHttpResponse(
    await listTourRequestsBff(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
