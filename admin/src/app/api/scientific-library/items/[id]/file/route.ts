import { serverEnv } from "@/core/env/server";
import { proxyScientificLibraryFile } from "@/features/scientific-library/application/scientific-library-file-proxy";
import { disabledScientificLibraryResponse } from "@/features/scientific-library/application/scientific-library-bff.route";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";

export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(
  request: Request,
  context: Context,
): Promise<Response> {
  const disabled = disabledScientificLibraryResponse();
  if (disabled) return disabled;

  return proxyScientificLibraryFile(
    (await context.params).id,
    request,
    createAuthBffRequestContext(request).token,
    {
      backendApiUrl: serverEnv.BACKEND_API_URL,
      fetch: globalThis.fetch,
    },
  );
}
