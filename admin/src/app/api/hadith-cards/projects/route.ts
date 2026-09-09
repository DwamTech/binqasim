import { serverApiClient } from "@/core/api/server-api-client";
import {
  createHadithCardProjectBff,
  listHadithCardProjectsBff,
  toHadithCardsHttpResponse,
} from "@/features/hadith-cards/application/hadith-cards-bff.core";
import {
  disabledHadithCardsModuleResponse,
  unsafeHadithCardsMutationResponse,
} from "@/features/hadith-cards/application/hadith-cards-bff.route";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET(request: Request): Promise<Response> {
  const disabled = disabledHadithCardsModuleResponse();
  if (disabled) return disabled;
  return toHadithCardsHttpResponse(
    await listHadithCardProjectsBff(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}

export async function POST(request: Request): Promise<Response> {
  const disabled = disabledHadithCardsModuleResponse();
  if (disabled) return disabled;
  const unsafe = unsafeHadithCardsMutationResponse(request);
  if (unsafe) return unsafe;
  return toHadithCardsHttpResponse(
    await createHadithCardProjectBff(
      request,
      serverApiClient,
      createAuthBffRequestContext(request).token,
    ),
  );
}
