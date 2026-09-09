import { serverApiClient } from "@/core/api/server-api-client";
import {
  getFeedback,
  toFeedbackHttpResponse,
} from "@/features/feedback/feedback-bff.core";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  return toFeedbackHttpResponse(
    await getFeedback(
      (await context.params).id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
