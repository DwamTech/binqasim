import { serverApiClient } from "@/core/api/server-api-client";
import {
  deleteHadithCardProjectBff,
  getHadithCardProjectBff,
  toHadithCardsHttpResponse,
  updateHadithCardProjectBff,
} from "@/features/hadith-cards/application/hadith-cards-bff.core";
import {
  disabledHadithCardsModuleResponse,
  unsafeHadithCardsMutationResponse,
} from "@/features/hadith-cards/application/hadith-cards-bff.route";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";

export const runtime = "nodejs";
export const maxDuration = 120;

type Context = { params: Promise<{ id: string }> };

export async function GET(
  request: Request,
  context: Context,
): Promise<Response> {
  const disabled = disabledHadithCardsModuleResponse();
  if (disabled) return disabled;
  return toHadithCardsHttpResponse(
    await getHadithCardProjectBff(
      (await context.params).id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}

export async function PATCH(
  request: Request,
  context: Context,
): Promise<Response> {
  const disabled = disabledHadithCardsModuleResponse();
  if (disabled) return disabled;
  const unsafe = unsafeHadithCardsMutationResponse(request);
  if (unsafe) return unsafe;
  return toHadithCardsHttpResponse(
    await updateHadithCardProjectBff(
      (await context.params).id,
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}

export async function DELETE(
  request: Request,
  context: Context,
): Promise<Response> {
  const disabled = disabledHadithCardsModuleResponse();
  if (disabled) return disabled;
  const unsafe = unsafeHadithCardsMutationResponse(request);
  if (unsafe) return unsafe;
  return toHadithCardsHttpResponse(
    await deleteHadithCardProjectBff(
      (await context.params).id,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
