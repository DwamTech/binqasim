"use client";

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { themeConfig } from "@/design-system/theme/theme.config";
import { dashboardCopy } from "@/core/config/dashboard-copy";

import { AdminHeader } from "./admin-header";
import { AdminSidebar } from "./admin-sidebar";
import styles from "./admin-shell.module.css";
import { MobileNavigation } from "./mobile-navigation";

export type AdminShellAdmin = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "author" | "reviewer" | "super_admin";
  isActive?: true;
  dashboardPermissions?: readonly string[];
};

export type NavigationItem = {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  /** A compact, live review count attached to a navigation destination. */
  notification?: {
    count: number;
    label: string;
  };
  children?: NavigationItem[];
  disabled?: boolean;
  external?: boolean;
};

export type AdminShellProps = {
  admin: AdminShellAdmin;
  navigation?: NavigationItem[];
  onLogout: () => void | Promise<void>;
  children: ReactNode;
};

const placeholderAdminNavigation: NavigationItem[] = [
  {
    id: "dashboard",
    label: dashboardCopy.common.dashboard,
    href: "/dashboard",
  },
  {
    id: "settings-placeholder",
    label: "الإعدادات",
    href: "/settings",
    disabled: true,
  },
];

const AdminContext = createContext<AdminShellAdmin | null>(null);
const NavigationContext = createContext<readonly NavigationItem[]>([]);

export function useAdminShellAdmin(): AdminShellAdmin {
  const admin = useContext(AdminContext);
  if (!admin)
    throw new Error("useAdminShellAdmin must be used within AdminShell");
  return admin;
}

export function useAdminShellNavigation(): readonly NavigationItem[] {
  return useContext(NavigationContext);
}

export function AdminShell({
  admin,
  navigation = placeholderAdminNavigation,
  onLogout,
  children,
}: AdminShellProps) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const mobileNavigationToggleRef = useRef<HTMLButtonElement>(null);
  const value = useMemo(() => admin, [admin]);

  return (
    <AdminContext.Provider value={value}>
      <NavigationContext.Provider value={navigation}>
        <div
          className={`${styles.shell} ${collapsed ? styles.sidebarCollapsed : ""}`}
          dir={themeConfig.layout.direction}
        >
          <AdminSidebar
            navigation={navigation}
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
            onLogout={onLogout}
          />
          <MobileNavigation
            open={mobileNavigationOpen}
            navigation={navigation}
            onLogout={onLogout}
            onOpenChange={setMobileNavigationOpen}
            triggerRef={mobileNavigationToggleRef}
          />
          <div className={styles.content}>
            <AdminHeader
              admin={admin}
              mobileNavigationOpen={mobileNavigationOpen}
              onMobileNavigationChange={setMobileNavigationOpen}
              onLogout={onLogout}
              mobileNavigationToggleRef={mobileNavigationToggleRef}
            />
            <main className={styles.main}>
              <div className={styles.mainInner} data-admin-content-frame>
                {children}
              </div>
            </main>
          </div>
          <div id="admin-floating-overlays" />
          <div id="admin-global-overlays" aria-live="polite" />
        </div>
      </NavigationContext.Provider>
    </AdminContext.Provider>
  );
}
