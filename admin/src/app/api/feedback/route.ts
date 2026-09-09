import { serverApiClient } from "@/core/api/server-api-client";
import {
  listFeedback,
  toFeedbackHttpResponse,
} from "@/features/feedback/feedback-bff.core";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";

export async function GET(request: Request): Promise<Response> {
  return toFeedbackHttpResponse(
    await listFeedback(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
