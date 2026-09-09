import { serverApiClient } from "@/core/api/server-api-client";
import {
  toFeedbackHttpResponse,
  updateFeedbackStatus,
} from "@/features/feedback/feedback-bff.core";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (!isSameOriginMutation(request))
    return toFeedbackHttpResponse({
      status: 403,
      body: {
        success: false,
        error: { code: "AUTH_FORBIDDEN", message: "Invalid request origin." },
      },
    });
  return toFeedbackHttpResponse(
    await updateFeedbackStatus(
      (await context.params).id,
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
