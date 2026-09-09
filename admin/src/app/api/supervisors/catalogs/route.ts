import { serverApiClient } from "@/core/api/server-api-client";
import {
  getSupervisorCatalogs,
  toSupervisorsHttpResponse,
} from "@/features/supervisors/supervisors-bff.core";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  return toSupervisorsHttpResponse(
    await getSupervisorCatalogs(
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
