import { serverApiClient } from "@/core/api/server-api-client";
import {
  deleteScientificVideo,
  getScientificVideo,
  scientificVideoHttpResponse,
  updateScientificVideo,
} from "@/features/scientific-videos/application/scientific-videos-bff";
import {
  disabledScientificVideosResponse,
  invalidScientificVideosOriginResponse,
} from "@/features/scientific-videos/application/scientific-videos-bff.route";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

export const runtime = "nodejs";
export const maxDuration = 180;
type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  const disabled = disabledScientificVideosResponse();
  if (disabled) return disabled;
  return scientificVideoHttpResponse(
    await getScientificVideo(
      (await context.params).id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
export async function PATCH(request: Request, context: Context) {
  const disabled = disabledScientificVideosResponse();
  if (disabled) return disabled;
  if (!isSameOriginMutation(request))
    return invalidScientificVideosOriginResponse();
  return scientificVideoHttpResponse(
    await updateScientificVideo(
      (await context.params).id,
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
export async function DELETE(request: Request, context: Context) {
  const disabled = disabledScientificVideosResponse();
  if (disabled) return disabled;
  if (!isSameOriginMutation(request))
    return invalidScientificVideosOriginResponse();
  return scientificVideoHttpResponse(
    await deleteScientificVideo(
      (await context.params).id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
