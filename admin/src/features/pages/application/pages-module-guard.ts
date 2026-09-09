import { isDashboardModuleEnabled } from "@/server/dal/dashboard-module-guards";

export function pagesModuleDisabledResponse(): Response | null {
  return isDashboardModuleEnabled("pages")
    ? null
    : Response.json(
        {
          success: false,
          error: { code: "AUTH_FORBIDDEN", message: "Module is disabled." },
        },
        { status: 404, headers: { "cache-control": "no-store" } },
      );
}
