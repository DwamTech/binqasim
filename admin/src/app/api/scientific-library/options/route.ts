import { serverApiClient } from "@/core/api/server-api-client";
import {
  getScientificLibraryOptions,
  toScientificLibraryHttpResponse,
} from "@/features/scientific-library/application/scientific-library-bff.core";
import { disabledScientificLibraryResponse } from "@/features/scientific-library/application/scientific-library-bff.route";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";

export async function GET(request: Request): Promise<Response> {
  const disabled = disabledScientificLibraryResponse();
  if (disabled) return disabled;
  return toScientificLibraryHttpResponse(
    await getScientificLibraryOptions(
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
