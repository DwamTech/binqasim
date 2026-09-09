import { serverApiClient } from "@/core/api/server-api-client";
import {
  createHadithCardBff,
  toHadithCardsHttpResponse,
} from "@/features/hadith-cards/application/hadith-cards-bff.core";
import {
  disabledHadithCardsModuleResponse,
  unsafeHadithCardsMutationResponse,
} from "@/features/hadith-cards/application/hadith-cards-bff.route";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request): Promise<Response> {
  const disabled = disabledHadithCardsModuleResponse();
  if (disabled) return disabled;
  const unsafe = unsafeHadithCardsMutationResponse(request);
  if (unsafe) return unsafe;
  return toHadithCardsHttpResponse(
    await createHadithCardBff(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
