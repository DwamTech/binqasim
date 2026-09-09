import {
  handleLogin,
  isNativeLoginFormRequest,
  toHttpResponse,
  toLoginHttpResponse,
  unavailableAuthBffResponse,
} from "@/server/auth-bff/auth-bff.core";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";
import { getAuthBffRuntime } from "@/server/auth-bff/runtime";
import { isSameOriginMutation } from "@/server/security/same-origin-request";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  if (!isSameOriginMutation(request)) {
    return toHttpResponse(
      {
        status: 403,
        body: {
          success: false,
          error: { code: "AUTH_FORBIDDEN", message: "Invalid request origin." },
        },
      },
      false,
    );
  }
  const runtime = getAuthBffRuntime();
  if (!runtime.ok) {
    return toHttpResponse(unavailableAuthBffResponse(), false);
  }

  const { dependencies } = runtime;
  const result = await handleLogin(
    request,
    dependencies,
    createAuthBffRequestContext(request),
  );

  return toLoginHttpResponse(
    result,
    dependencies.isProduction,
    isNativeLoginFormRequest(request),
  );
}
