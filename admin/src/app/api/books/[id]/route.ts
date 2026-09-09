import { serverApiClient } from "@/core/api/server-api-client";
import {
  deleteBook,
  getBook,
  toBooksHttpResponse,
  updateBook,
} from "@/features/books/application/books-bff.core";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

export const runtime = "nodejs";
export const maxDuration = 120;

type Context = { params: Promise<{ id: string }> };

export async function GET(
  request: Request,
  context: Context,
): Promise<Response> {
  return toBooksHttpResponse(
    await getBook(
      (await context.params).id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
      new URL(request.url).searchParams.get("area"),
    ),
  );
}

export async function PATCH(
  request: Request,
  context: Context,
): Promise<Response> {
  if (!isSameOriginMutation(request))
    return toBooksHttpResponse({
      status: 403,
      body: {
        success: false,
        error: { code: "AUTH_FORBIDDEN", message: "Invalid request origin." },
      },
    });
  return toBooksHttpResponse(
    await updateBook(
      (await context.params).id,
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
      new URL(request.url).searchParams.get("area"),
    ),
  );
}

export async function DELETE(
  request: Request,
  context: Context,
): Promise<Response> {
  if (!isSameOriginMutation(request))
    return toBooksHttpResponse({
      status: 403,
      body: {
        success: false,
        error: { code: "AUTH_FORBIDDEN", message: "Invalid request origin." },
      },
    });
  return toBooksHttpResponse(
    await deleteBook(
      (await context.params).id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
      new URL(request.url).searchParams.get("area"),
    ),
  );
}
