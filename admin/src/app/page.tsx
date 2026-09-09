import { redirect } from "next/navigation";

import { getRootRouteDestination } from "@/server/routing/root-route";
import {
  getServerAuthState,
  ServerAuthUnavailableError,
} from "@/server/dal/app-auth-guards";

export const dynamic = "force-dynamic";

export default async function Home() {
  const state = await getServerAuthState();
  if (state.status === "unavailable") {
    throw new ServerAuthUnavailableError();
  }

  redirect(
    getRootRouteDestination({
      authenticated: state.status === "authenticated",
    }),
  );
}
