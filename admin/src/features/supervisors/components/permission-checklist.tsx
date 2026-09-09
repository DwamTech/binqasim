"use client";

import type { DashboardPermission } from "@/features/auth/domain/auth.contracts";
import {
  dashboardModuleByPermission,
  getDashboardModuleStatus,
} from "../../../core/authorization/dashboard-modules";

import { permissionGroups, permissionLabels } from "../supervisors.contracts";
import styles from "./supervisors.module.css";

export function PermissionChecklist({
  value,
  onChange,
  disabled = false,
}: {
  value: readonly DashboardPermission[];
  onChange: (permissions: DashboardPermission[]) => void;
  disabled?: boolean;
}) {
  const toggle = (permission: DashboardPermission) => {
    const next = value.includes(permission)
      ? value.filter((item) => item !== permission)
      : [...value, permission];
    onChange(next);
  };

  return (
    <div className={styles.permissionGroups}>
      {permissionGroups.map((group) => (
        <section key={group.id} className={styles.permissionGroup}>
          <header>
            <h3>{group.label}</h3>
            {group.id === "reserved" && (
              <p>محفوظة للتفويض المستقبلي ولا تمنح غير المدير وصولًا حاليًا.</p>
            )}
          </header>
          <div>
            {group.permissions.map((permission) => {
              const metadata = dashboardModuleByPermission[permission];
              const status = getDashboardModuleStatus(permission);
              return (
                <label key={permission} className={styles.permissionOption}>
                  <input
                    type="checkbox"
                    checked={value.includes(permission)}
                    disabled={disabled}
                    onChange={() => toggle(permission)}
                  />
                  <span>
                    <strong>{permissionLabels[permission]}</strong>
                    <small dir="ltr">{permission}</small>
                  </span>
                  {status ? (
                    <em
                      className={
                        metadata.delegation === "admin-only"
                          ? styles.reservedBadge
                          : styles.futureBadge
                      }
                    >
                      {status}
                    </em>
                  ) : null}
                </label>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export function PermissionSummary({
  permissions,
}: {
  permissions: readonly DashboardPermission[];
}) {
  if (permissions.length === 0)
    return <p className={styles.noPermissions}>لا توجد صلاحيات فردية.</p>;
  return (
    <div className={styles.permissionSummary}>
      {permissionGroups.map((group) => {
        const groupPermissions = group.permissions.filter((permission) =>
          permissions.includes(permission),
        );
        if (groupPermissions.length === 0) return null;
        return (
          <section key={group.id}>
            <h3>{group.label}</h3>
            <ul>
              {groupPermissions.map((permission) => (
                <li key={permission}>
                  <strong>{permissionLabels[permission]}</strong>
                  <span dir="ltr">{permission}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
