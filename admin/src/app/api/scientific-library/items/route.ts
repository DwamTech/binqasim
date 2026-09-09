import { serverApiClient } from "@/core/api/server-api-client";
import {
  createScientificLibraryItem,
  listScientificLibraryItems,
  toScientificLibraryHttpResponse,
} from "@/features/scientific-library/application/scientific-library-bff.core";
import {
  disabledScientificLibraryResponse,
  invalidScientificLibraryOriginResponse,
} from "@/features/scientific-library/application/scientific-library-bff.route";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET(request: Request): Promise<Response> {
  const disabled = disabledScientificLibraryResponse();
  if (disabled) return disabled;
  return toScientificLibraryHttpResponse(
    await listScientificLibraryItems(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}

export async function POST(request: Request): Promise<Response> {
  const disabled = disabledScientificLibraryResponse();
  if (disabled) return disabled;
  if (!isSameOriginMutation(request))
    return invalidScientificLibraryOriginResponse();
  return toScientificLibraryHttpResponse(
    await createScientificLibraryItem(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
