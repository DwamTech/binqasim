/** Token rotation is intentionally unsupported by the current Laravel contract. */
export async function POST(): Promise<Response> {
  return new Response(null, {
    status: 404,
    headers: { "cache-control": "no-store" },
  });
}
