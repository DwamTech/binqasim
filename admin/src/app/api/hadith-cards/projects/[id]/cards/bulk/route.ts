import { serverApiClient } from "@/core/api/server-api-client";
import {
  bulkCreateHadithCardsBff,
  toHadithCardsHttpResponse,
} from "@/features/hadith-cards/application/hadith-cards-bff.core";
import {
  disabledHadithCardsModuleResponse,
  unsafeHadithCardsMutationResponse,
} from "@/features/hadith-cards/application/hadith-cards-bff.route";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";

export const runtime = "nodejs";
export const maxDuration = 120;

type Context = { params: Promise<{ id: string }> };

export async function POST(
  request: Request,
  context: Context,
): Promise<Response> {
  const disabled = disabledHadithCardsModuleResponse();
  if (disabled) return disabled;
  const unsafe = unsafeHadithCardsMutationResponse(request);
  if (unsafe) return unsafe;
  return toHadithCardsHttpResponse(
    await bulkCreateHadithCardsBff(
      (await context.params).id,
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
