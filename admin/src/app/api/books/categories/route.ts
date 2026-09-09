import { serverApiClient } from "@/core/api/server-api-client";
import {
  createLibraryCategory,
  listLibraryCategories,
  toBooksHttpResponse,
} from "@/features/books/application/books-bff.core";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

export async function GET(request: Request) {
  const area = new URL(request.url).searchParams.get("area") ?? "";
  return toBooksHttpResponse(
    await listLibraryCategories(
      area,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}

export async function POST(request: Request) {
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
    await createLibraryCategory(
      area,
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
