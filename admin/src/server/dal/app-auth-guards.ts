import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAuthBffRuntime } from "../auth-bff/runtime";
import { sessionCookieName } from "../cookies/session-cookie";
import { safeRedirect } from "../routing/safe-redirect";
import type { AdminSummary } from "@/features/auth/domain/auth.contracts";
import {
  hasDashboardPermission,
  isDashboardAdmin,
} from "@/core/authorization/dashboard-access";
import type { DashboardPermission } from "@/features/auth/domain/auth.contracts";
import {
  loadServerAuthState,
  type ServerAuthState,
} from "./server-auth-state.core";

export type { ServerAuthState } from "./server-auth-state.core";

export class ServerAuthUnavailableError extends Error {
  constructor() {
    super("Authentication is temporarily unavailable.");
    this.name = "ServerAuthUnavailableError";
  }
}

export async function getServerAuthState(): Promise<ServerAuthState> {
  const runtime = getAuthBffRuntime();
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  return loadServerAuthState(
    token,
    runtime.ok ? runtime.dependencies.authRepository : undefined,
  );
}

export async function requireAdmin(): Promise<AdminSummary> {
  const state = await getServerAuthState();
  if (state.status === "unauthenticated") {
    redirect("/login");
  }

  if (state.status === "unavailable") {
    throw new ServerAuthUnavailableError();
  }

  return state.admin;
}

export async function requireDashboardPermission(
  permission: DashboardPermission,
): Promise<AdminSummary> {
  const actor = await requireAdmin();
  if (!hasDashboardPermission(actor, permission))
    redirect("/dashboard/no-access");
  return actor;
}

export async function requireDashboardAdmin(): Promise<AdminSummary> {
  const actor = await requireAdmin();
  if (!isDashboardAdmin(actor)) redirect("/dashboard/no-access");
  return actor;
}

export async function requireGuest(): Promise<void> {
  const state = await getServerAuthState();
  if (state.status === "authenticated") {
    redirect(
      safeRedirect("/dashboard", {
        currentPath: "/login",
        fallback: "/dashboard",
      }),
    );
  }

  if (state.status === "unavailable") {
    throw new ServerAuthUnavailableError();
  }
}
