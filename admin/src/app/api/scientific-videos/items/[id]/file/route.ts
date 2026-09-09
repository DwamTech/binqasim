import { createBackendUrl } from "@/core/api/laravel-url";
import { serverEnv } from "@/core/env/server";
import { disabledScientificVideosResponse } from "@/features/scientific-videos/application/scientific-videos-bff.route";
import { createAuthBffRequestContext } from "@/server/auth-bff/route-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 180;
type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  const disabled = disabledScientificVideosResponse();
  if (disabled) return disabled;
  const id = (await context.params).id;
  const token = createAuthBffRequestContext(request).token;
  if (!token)
    return Response.json({ message: "انتهت الجلسة." }, { status: 401 });
  if (!/^[1-9]\d*$/.test(id) || !serverEnv.BACKEND_API_URL)
    return Response.json({ message: "الملف غير موجود." }, { status: 404 });

  let upstream: Response;
  try {
    upstream = await fetch(
      createBackendUrl(
        serverEnv.BACKEND_API_URL,
        `/admin/scientific-videos/items/${id}/file`,
      ),
      {
        headers: {
          Accept: "video/*,application/octet-stream",
          Authorization: `Bearer ${token}`,
          ...(request.headers.get("range")
            ? { Range: request.headers.get("range") as string }
            : {}),
          ...(request.headers.get("if-range")
            ? { "If-Range": request.headers.get("if-range") as string }
            : {}),
        },
        cache: "no-store",
      },
    );
  } catch {
    return Response.json({ message: "تعذّر تحميل الفيديو." }, { status: 502 });
  }
  if (![200, 206].includes(upstream.status) || !upstream.body) {
    return Response.json(
      {
        message:
          upstream.status === 404 ? "الملف غير موجود." : "تعذّر تحميل الفيديو.",
      },
      { status: upstream.status === 404 ? 404 : 502 },
    );
  }
  const contentType = upstream.headers.get("content-type") || "";
  if (
    !contentType.startsWith("video/") &&
    !contentType.includes("octet-stream")
  )
    return Response.json({ message: "نوع الملف غير صالح." }, { status: 502 });
  const headers = new Headers({
    "content-type": contentType,
    "cache-control": "private, no-store",
    "x-content-type-options": "nosniff",
  });
  for (const name of [
    "content-length",
    "content-range",
    "accept-ranges",
    "etag",
    "last-modified",
  ]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  return new Response(upstream.body, { status: upstream.status, headers });
}
