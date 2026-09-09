import { serverApiClient } from "@/core/api/server-api-client";
import {
  answerFatwaInboxBff,
  toFatwaInboxHttpResponse,
  updateFatwaInboxAnswerBff,
} from "@/features/scientific-fatwas/application/fatwa-inbox-bff.core";
import {
  disabledScientificFatwasResponse,
  unsafeScientificFatwaMutationResponse,
} from "@/features/scientific-fatwas/application/scientific-fatwas-bff.route";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

async function mutate(
  request: Request,
  context: Context,
  updating: boolean,
): Promise<Response> {
  const disabled = disabledScientificFatwasResponse();
  if (disabled) return disabled;
  const unsafe = unsafeScientificFatwaMutationResponse(request);
  if (unsafe) return unsafe;
  const id = (await context.params).id;
  const token = createAuthBffRequestContext(request).token;
  return toFatwaInboxHttpResponse(
    updating
      ? await updateFatwaInboxAnswerBff(id, request, serverApiClient, token)
      : await answerFatwaInboxBff(id, request, serverApiClient, token),
  );
}

export function POST(request: Request, context: Context): Promise<Response> {
  return mutate(request, context, false);
}

export function PUT(request: Request, context: Context): Promise<Response> {
  return mutate(request, context, true);
}
