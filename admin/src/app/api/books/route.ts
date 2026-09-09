import { serverApiClient } from "@/core/api/server-api-client";
import {
  createBook,
  listBooks,
  toBooksHttpResponse,
} from "@/features/books/application/books-bff.core";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET(request: Request): Promise<Response> {
  return toBooksHttpResponse(
    await listBooks(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}

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
    await createBook(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
      new URL(request.url).searchParams.get("area"),
    ),
  );
}
