import { serverApiClient } from "@/core/api/server-api-client";
import {
  getScientificVideoOptions,
  scientificVideoHttpResponse,
} from "@/features/scientific-videos/application/scientific-videos-bff";
import { disabledScientificVideosResponse } from "@/features/scientific-videos/application/scientific-videos-bff.route";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";

export async function GET(request: Request) {
  const disabled = disabledScientificVideosResponse();
  if (disabled) return disabled;
  return scientificVideoHttpResponse(
    await getScientificVideoOptions(
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
