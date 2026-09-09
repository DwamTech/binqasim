import type { ThemeConfig } from "./theme.types";
import { clientEnv } from "@/core/env/client";

export const themeConfig: ThemeConfig = {
  brand: {
    name: clientEnv.NEXT_PUBLIC_APP_NAME,
    shortName: clientEnv.NEXT_PUBLIC_APP_SHORT_NAME,
    logo: clientEnv.NEXT_PUBLIC_BRAND_LOGO,
    darkLogo: clientEnv.NEXT_PUBLIC_BRAND_DARK_LOGO,
    logoMark: clientEnv.NEXT_PUBLIC_BRAND_MARK,
    loginShowcaseTitle: clientEnv.NEXT_PUBLIC_LOGIN_SHOWCASE_TITLE,
    loginShowcaseLogo: clientEnv.NEXT_PUBLIC_LOGIN_SHOWCASE_LOGO,
  },
  layout: {
    direction: clientEnv.NEXT_PUBLIC_APP_DIRECTION,
    sidebarPosition: "right",
    sidebarCollapsible: true,
    stickyHeader: true,
  },
};
