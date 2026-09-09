import { serverApiClient } from "@/core/api/server-api-client";
import {
  deleteLibraryCategory,
  toBooksHttpResponse,
  updateLibraryCategory,
} from "@/features/books/application/books-bff.core";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  if (!isSameOriginMutation(request))
    return toBooksHttpResponse({
      status: 403,
      body: {
        success: false,
        error: { code: "AUTH_FORBIDDEN", message: "Invalid request origin." },
      },
    });
  const area = new URL(request.url).searchParams.get("area") ?? "";
  return toBooksHttpResponse(
    await updateLibraryCategory(
      area,
      (await context.params).id,
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}

export async function DELETE(request: Request, context: Context) {
  if (!isSameOriginMutation(request))
    return toBooksHttpResponse({
      status: 403,
      body: {
        success: false,
        error: { code: "AUTH_FORBIDDEN", message: "Invalid request origin." },
      },
    });
  const area = new URL(request.url).searchParams.get("area") ?? "";
  return toBooksHttpResponse(
    await deleteLibraryCategory(
      area,
      (await context.params).id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
