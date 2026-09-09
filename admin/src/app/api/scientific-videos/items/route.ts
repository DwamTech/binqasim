import { serverApiClient } from "@/core/api/server-api-client";
import {
  createScientificVideo,
  listScientificVideos,
  scientificVideoHttpResponse,
} from "@/features/scientific-videos/application/scientific-videos-bff";
import {
  disabledScientificVideosResponse,
  invalidScientificVideosOriginResponse,
} from "@/features/scientific-videos/application/scientific-videos-bff.route";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

export const runtime = "nodejs";
export const maxDuration = 180;

export async function GET(request: Request) {
  const disabled = disabledScientificVideosResponse();
  if (disabled) return disabled;
  return scientificVideoHttpResponse(
    await listScientificVideos(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
export async function POST(request: Request) {
  const disabled = disabledScientificVideosResponse();
  if (disabled) return disabled;
  if (!isSameOriginMutation(request))
    return invalidScientificVideosOriginResponse();
  return scientificVideoHttpResponse(
    await createScientificVideo(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
