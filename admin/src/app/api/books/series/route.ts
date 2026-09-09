import { serverApiClient } from "@/core/api/server-api-client";
import {
  createBookSeries,
  toBooksHttpResponse,
} from "@/features/books/application/books-bff.core";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

export async function POST(request: Request): Promise<Response> {
  if (!isSameOriginMutation(request))
    return toBooksHttpResponse({
      status: 403,
      body: {
        success: false,
        error: { code: "AUTH_FORBIDDEN", message: "Invalid request origin." },
      },
    });
  return toBooksHttpResponse(
    await createBookSeries(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
