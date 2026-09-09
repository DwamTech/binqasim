import { serverApiClient } from "@/core/api/server-api-client";
import {
  getTourRequestBff,
  toTourGuidesHttpResponse,
} from "@/features/tour-guides/application/tour-guides-bff.core";
import { disabledTourGuidesResponse } from "@/features/tour-guides/application/tour-guides-bff.route";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const disabled = disabledTourGuidesResponse();
  if (disabled) return disabled;
  return toTourGuidesHttpResponse(
    await getTourRequestBff(
      (await context.params).id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
