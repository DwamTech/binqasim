"use client";

import { DropdownMenu, DropdownMenuItem } from "@/shared/components/ui";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { RefObject } from "react";
import { dashboardCopy } from "@/core/config/dashboard-copy";

import {
  getAdminInitials,
  getAdminRoleLabel,
} from "./admin-navigation.helpers";
import { getDashboardBreadcrumbs } from "./dashboard-breadcrumbs";
import type { AdminShellAdmin } from "./admin-shell";
import styles from "./admin-header.module.css";

export type UserMenuProps = {
  adminName: string;
  adminEmail?: string;
  adminRole: AdminShellAdmin["role"];
  onLogout: () => void | Promise<void>;
};

export function UserMenuContent({
  adminName,
  adminEmail,
  adminRole,
  onAccount,
  onLogout,
}: Omit<UserMenuProps, "onLogout"> & {
  onAccount: () => void;
  onLogout: () => void | Promise<void>;
}) {
  return (
    <>
      <div className={styles.userDetails}>
        <strong>{adminName}</strong>
        {adminEmail && <span>{adminEmail}</span>}
        <span className={styles.roleLabel}>{getAdminRoleLabel(adminRole)}</span>
      </div>
      <DropdownMenuItem onSelect={onAccount}>
        {dashboardCopy.common.account}
      </DropdownMenuItem>
      <DropdownMenuItem
        className={styles.logoutItem ?? ""}
        onSelect={() => void onLogout()}
      >
        {dashboardCopy.common.logout}
      </DropdownMenuItem>
    </>
  );
}

function UserMenu({
  adminName,
  adminEmail,
  adminRole,
  onLogout,
}: UserMenuProps) {
  const router = useRouter();

  return (
    <DropdownMenu
      trigger={
        <span className={styles.userTrigger}>
          <span className={styles.avatar} aria-hidden="true">
            {getAdminInitials(adminName)}
          </span>
          <span className={styles.userCopy}>
            <span className={styles.userName}>{adminName}</span>
            <span className={styles.userHint}>عرض الحساب</span>
          </span>
          <svg
            className={styles.chevron}
            viewBox="0 0 20 20"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d="m5 7.5 5 5 5-5" />
          </svg>
        </span>
      }
    >
      <UserMenuContent
        adminName={adminName}
        {...(adminEmail ? { adminEmail } : {})}
        adminRole={adminRole}
        onAccount={() => router.push("/dashboard/account")}
        onLogout={onLogout}
      />
    </DropdownMenu>
  );
}

export function AdminHeader({
  admin,
  mobileNavigationOpen,
  onMobileNavigationChange,
  onLogout,
  mobileNavigationToggleRef,
}: {
  admin: AdminShellAdmin;
  mobileNavigationOpen: boolean;
  onMobileNavigationChange: (open: boolean) => void;
  onLogout: () => void | Promise<void>;
  mobileNavigationToggleRef: RefObject<HTMLButtonElement | null>;
}) {
  const breadcrumbs = getDashboardBreadcrumbs(usePathname());

  return (
    <header className={styles.header}>
      <button
        type="button"
        ref={mobileNavigationToggleRef}
        className={`${styles.mobileToggle} ui-focus`}
        onClick={() => onMobileNavigationChange(!mobileNavigationOpen)}
        aria-label="فتح التنقل"
        aria-expanded={mobileNavigationOpen}
        aria-controls="admin-mobile-navigation"
      >
        ☰
      </button>
      <nav className={styles.breadcrumb} aria-label="مسار التنقل">
        <ol>
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={`${breadcrumb.label}-${index}`}>
              {breadcrumb.href ? (
                <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
              ) : (
                <span aria-current="page">{breadcrumb.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <UserMenu
        adminName={admin.name}
        adminEmail={admin.email}
        adminRole={admin.role}
        onLogout={onLogout}
      />
    </header>
  );
}
