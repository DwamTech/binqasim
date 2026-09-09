export type ThemeMode = "light" | "dark" | "system";

export type Direction = "rtl" | "ltr";

export interface ThemeConfig {
  brand: {
    name: string;
    shortName: string;
    logo: string;
    darkLogo: string;
    logoMark: string;
    loginShowcaseTitle: string;
    loginShowcaseLogo: string;
  };
  layout: {
    direction: Direction;
    sidebarPosition: "left" | "right";
    sidebarCollapsible: boolean;
    stickyHeader: boolean;
  };
}
