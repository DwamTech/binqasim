"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { themeConfig } from "@/design-system/theme/theme.config";
import { dashboardCopy } from "@/core/config/dashboard-copy";
import { OptionalPublicLogo } from "@/shared/components/ui/optional-public-logo";
import { formatArabicNumber } from "@/shared/lib/arabic-format";

import {
  getCurrentNavigationItemId,
  isNavigationItemActive,
} from "./admin-navigation.helpers";
import type { NavigationItem } from "./admin-shell";
import styles from "./admin-sidebar.module.css";

type AdminSidebarProps = {
  navigation: NavigationItem[];
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  mobile?: boolean;
  onNavigate?: () => void;
  onLogout: () => void | Promise<void>;
};

type AdminSidebarViewProps = AdminSidebarProps & {
  pathname: string;
};

function NavigationGlyph({ id }: { id: string }) {
  const common = {
    viewBox: "0 0 24 24",
    width: 20,
    height: 20,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (id.includes("settings")) {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.42 1.42-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56V20h-2v-.08A1.7 1.7 0 0 0 12.36 18a1.7 1.7 0 0 0-1.88.34l-.06.06L9 17l.06-.06A1.7 1.7 0 0 0 9.4 15a1.7 1.7 0 0 0-1.56-1.04H7v-2h.84A1.7 1.7 0 0 0 9.4 11a1.7 1.7 0 0 0-.34-1.88L9 9.06l1.42-1.42.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 13.4 6.5V6h2v.5a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.42 1.42-.06.06A1.7 1.7 0 0 0 19.4 11c.14.6.65 1 1.26 1H21v2h-.34c-.61 0-1.12.4-1.26 1Z" />
      </svg>
    );
  }

  if (id.includes("report")) {
    return (
      <svg {...common}>
        <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />
      </svg>
    );
  }

  if (id.includes("email")) {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m5 8 7 5 7-5" />
      </svg>
    );
  }

  if (id.includes("application")) {
    return (
      <svg {...common}>
        <path d="M7 3h10v4H7zM5 7h14v14H5z" />
        <path d="M8 11h8M8 15h8M8 19h5" />
      </svg>
    );
  }

  if (id.includes("comment")) {
    return (
      <svg {...common}>
        <path d="M6.5 4h8A2.5 2.5 0 0 1 17 6.5v4a2.5 2.5 0 0 1-2.5 2.5H10l-4 3v-3.2A2.5 2.5 0 0 1 4 10.35V6.5A2.5 2.5 0 0 1 6.5 4Z" />
        <path d="M17 8h.5a2.5 2.5 0 0 1 2.5 2.5v3.85a2.5 2.5 0 0 1-2 2.45V20l-4-3h-2.5a2.5 2.5 0 0 1-2.3-1.52" />
      </svg>
    );
  }

  if (id.includes("article") || id.includes("content")) {
    return (
      <svg {...common}>
        <path d="M6 3h9l3 3v15H6z" />
        <path d="M14 3v4h4M9 12h6M9 16h6" />
      </svg>
    );
  }

  if (id.includes("visual")) {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m10 9 5 3-5 3z" />
      </svg>
    );
  }

  if (id.includes("gallery")) {
    return (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <circle cx="9" cy="9" r="1.75" />
        <path d="m5.5 17 4.2-4 3 2.6 2.8-2.7 3 4.1" />
      </svg>
    );
  }

  if (id.includes("supervisor")) {
    return (
      <svg {...common}>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.25" />
        <path d="M3.5 19a5.5 5.5 0 0 1 11 0M14 14.5a4.5 4.5 0 0 1 6.5 4" />
      </svg>
    );
  }

  if (id.includes("tour-guide") || id.includes("tour-request")) {
    return (
      <svg {...common}>
        <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" />
        <circle cx="12" cy="10" r="2.2" />
        <path d="M4 20h16" />
      </svg>
    );
  }

  if (id.includes("section")) {
    return (
      <svg {...common}>
        <rect x="3" y="4" width="4" height="4" rx="1" />
        <rect x="3" y="10" width="4" height="4" rx="1" />
        <rect x="3" y="16" width="4" height="4" rx="1" />
        <path d="M10 6h11M10 12h11M10 18h11" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function NavigationEntry({
  item,
  pathname,
  currentItemId,
  collapsed,
  onNavigate,
  nested = false,
}: {
  item: NavigationItem;
  pathname: string;
  currentItemId: string | undefined;
  collapsed: boolean;
  onNavigate?: () => void;
  nested?: boolean;
}) {
  const active = isNavigationItemActive(item, pathname);
  const [expanded, setExpanded] = useState(active);
  const current = item.id === currentItemId;
  const isCurrentPage = item.href === pathname;
  const notification = item.notification;
  const notificationText = notification
    ? `${formatArabicNumber(notification.count)} ${notification.label}`
    : undefined;
  const accessibleLabel = notificationText
    ? `${item.label}، ${notificationText}`
    : undefined;
  const content: ReactNode = (
    <>
      <span className={styles.icon} aria-hidden="true">
        {item.icon ?? <NavigationGlyph id={item.id} />}
      </span>
      <span className={styles.label}>{item.label}</span>
      {notification && (
        <span className={styles.notificationBadge} aria-hidden="true">
          {notification.count > 99
            ? `${formatArabicNumber(99)}+`
            : formatArabicNumber(notification.count)}
        </span>
      )}
    </>
  );
  const className = `${styles.link} ${current ? styles.active : ""} ${nested ? styles.nested : ""}`;
  const linkProps = {
    className,
    href: item.href,
    ...(isCurrentPage ? { "aria-current": "page" as const } : {}),
    ...(accessibleLabel ? { "aria-label": accessibleLabel } : {}),
    ...(collapsed ? { title: accessibleLabel ?? item.label } : {}),
    ...(onNavigate ? { onClick: onNavigate } : {}),
  };

  return (
    <li>
      {item.disabled ? (
        <span
          className={`${className} ${styles.disabled}`}
          aria-disabled="true"
        >
          {content}
        </span>
      ) : item.children && !collapsed ? (
        <button
          type="button"
          className={className}
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          {...(accessibleLabel ? { "aria-label": accessibleLabel } : {})}
        >
          {content}
          <span className={styles.chevron} aria-hidden="true">
            {expanded ? "⌃" : "⌄"}
          </span>
        </button>
      ) : item.external ? (
        <a {...linkProps} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      ) : (
        <Link {...linkProps}>{content}</Link>
      )}
      {item.children && !collapsed && expanded && (
        <ul className={styles.nestedList}>
          {item.children.map((child) => (
            <NavigationEntry
              key={child.id}
              item={child}
              pathname={pathname}
              currentItemId={currentItemId}
              collapsed={collapsed}
              {...(onNavigate ? { onNavigate } : {})}
              nested
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function AdminSidebarView({
  navigation,
  collapsed,
  onCollapsedChange,
  mobile = false,
  onNavigate,
  onLogout,
  pathname,
}: AdminSidebarViewProps) {
  const effectiveCollapsed = mobile ? false : collapsed;
  const currentItemId = getCurrentNavigationItemId(navigation, pathname);
  return (
    <aside
      className={`${styles.sidebar} ${effectiveCollapsed ? styles.collapsed : ""} ${mobile ? styles.mobile : ""}`}
      aria-label="التنقل الرئيسي"
    >
      <div className={styles.brand}>
        <OptionalPublicLogo
          className={styles.publicBrand ?? ""}
          imageClassName={styles.publicBrandImage ?? ""}
          alt={themeConfig.brand.name}
          sizes={effectiveCollapsed ? "32px" : "112px"}
          priority
          fallback={
            <>
              <Image
                src={themeConfig.brand.logoMark}
                alt=""
                className={styles.mark}
                width={48}
                height={48}
              />
              <span className={styles.brandLabel}>
                {themeConfig.brand.shortName}
              </span>
            </>
          }
        />
        {!mobile && (
          <button
            type="button"
            className={`${styles.collapseButton} ui-focus`}
            onClick={() => onCollapsedChange(!collapsed)}
            aria-label={
              collapsed ? "توسيع الشريط الجانبي" : "طي الشريط الجانبي"
            }
            aria-pressed={collapsed}
          >
            {collapsed ? "›" : "‹"}
          </button>
        )}
      </div>
      <nav className={styles.navigation}>
        <ul>
          {navigation.map((item) => (
            <NavigationEntry
              key={item.id}
              item={item}
              pathname={pathname}
              currentItemId={currentItemId}
              collapsed={effectiveCollapsed}
              {...(onNavigate ? { onNavigate } : {})}
            />
          ))}
        </ul>
      </nav>
      <a
        className={`${styles.supportCard} ui-focus`}
        href={`https://wa.me/${dashboardCopy.support.whatsapp}`}
        target="_blank"
        rel="noreferrer"
        title={effectiveCollapsed ? dashboardCopy.support.title : undefined}
        aria-label={`${dashboardCopy.support.title}: ${dashboardCopy.support.action}`}
      >
        <span className={styles.supportIcon} aria-hidden="true">
          <span className={styles.supportPulse} />
          <svg
            className={styles.supportAgent}
            viewBox="0 0 64 76"
            width="45"
            height="54"
            fill="none"
          >
            <path
              d="M11 76c1.6-16.5 9.3-24.7 21-24.7S51.5 59.5 53 76H11Z"
              fill="var(--color-accent)"
            />
            <path
              d="M23 48.5v8.8c2.8 3.2 6 4.8 9.4 4.8 3.3 0 6.3-1.6 8.9-4.8v-9.1"
              fill="var(--color-surface)"
              stroke="var(--color-brown)"
              strokeWidth="2"
            />
            <ellipse
              cx="32"
              cy="31.5"
              rx="16.5"
              ry="20.5"
              fill="var(--color-surface)"
              stroke="var(--color-brown)"
              strokeWidth="2"
            />
            <path
              d="M17 28.7c.7-13 6.3-19.5 16.7-19.5 9.1 0 14.2 5 15.5 15-4.8-1-9.2-3.2-13.2-6.5-4.7 5.7-11 9.4-19 11Z"
              fill="var(--color-dark-green)"
            />
            <path
              d="M20 33.5v-3.8c0-8.3 5.4-14.7 12.2-14.7h.2c6.8 0 12.3 6.4 12.3 14.7v4"
              stroke="var(--color-accent)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <rect
              x="14.5"
              y="29"
              width="7"
              height="13"
              rx="3.5"
              fill="var(--color-green)"
              stroke="var(--color-accent)"
              strokeWidth="1.5"
            />
            <rect
              x="43"
              y="29"
              width="7"
              height="13"
              rx="3.5"
              fill="var(--color-green)"
              stroke="var(--color-accent)"
              strokeWidth="1.5"
            />
            <path
              d="M47 41c-.2 5.6-3.4 8.4-9.6 8.4"
              stroke="var(--color-accent)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <rect
              x="34.5"
              y="47"
              width="6.5"
              height="3.5"
              rx="1.75"
              fill="var(--color-accent)"
            />
            <circle
              cx="26.5"
              cy="32.5"
              r="1.35"
              fill="var(--color-dark-green)"
            />
            <circle
              cx="38.5"
              cy="32.5"
              r="1.35"
              fill="var(--color-dark-green)"
            />
            <path
              d="M27.5 40c3.1 2.2 6.1 2.2 9 0"
              stroke="var(--color-brown)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span className={styles.supportContent}>
          <strong>{dashboardCopy.support.title}</strong>
          <small>{dashboardCopy.support.action}</small>
        </span>
        <span className={styles.supportArrow} aria-hidden="true">
          ↗
        </span>
        <span className={styles.supportStatus} aria-hidden="true">
          <span />
          متاح الآن
        </span>
      </a>
      <footer className={styles.footer}>
        <button
          type="button"
          className={`${styles.logoutButton} ui-focus`}
          onClick={() => void onLogout()}
          title={effectiveCollapsed ? dashboardCopy.common.logout : undefined}
          aria-label={dashboardCopy.common.logout}
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M10 17l5-5-5-5M15 12H3" />
            <path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
          </svg>
          <span className={styles.label}>{dashboardCopy.common.logout}</span>
        </button>
      </footer>
    </aside>
  );
}

export function AdminSidebar(props: AdminSidebarProps) {
  return <AdminSidebarView {...props} pathname={usePathname()} />;
}
