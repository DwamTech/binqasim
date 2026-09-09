"use client";

import type { ReactNode } from "react";

import { createBffLogoutHandler, navigateToLogin } from "./logout-bff.client";
import { SessionValidator } from "./session-validator.client";
import { getDashboardNavigation } from "@/shared/components/layout/dashboard-navigation";
import { AdminShell } from "@/shared/components/layout/admin-shell";
import type { AdminSummary } from "@/features/auth/domain/auth.contracts";
import type { DashboardModuleFlags } from "@/core/config/dashboard-module-flags";
import { disabledDashboardModuleFlags } from "@/core/config/dashboard-module-flags";
import type { DashboardPendingReviewCounts } from "@/features/dashboard-notifications/domain/pending-review-counts.contracts";

export function ProtectedAdminShell({
  admin,
  moduleFlags = disabledDashboardModuleFlags,
  pendingReviewCounts = {},
  children,
}: {
  admin: AdminSummary;
  moduleFlags?: DashboardModuleFlags;
  pendingReviewCounts?: DashboardPendingReviewCounts;
  children: ReactNode;
}) {
  return (
    <AdminShell
      admin={admin}
      navigation={getDashboardNavigation(
        admin,
        moduleFlags,
        pendingReviewCounts,
      )}
      onLogout={createBffLogoutHandler(navigateToLogin)}
    >
      <SessionValidator onInvalid={navigateToLogin} />
      {children}
    </AdminShell>
  );
}
