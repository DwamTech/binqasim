import type { Metadata } from "next";
import {
  Alexandria,
  Amiri,
  Cairo,
  Montserrat,
  Noto_Kufi_Arabic,
  Tajawal,
} from "next/font/google";
import { dashboardCopy } from "@/core/config/dashboard-copy";
import { serverEnv } from "@/core/env/server";
import "@/design-system/styles/globals.css";
import { getThemeCustomProperties } from "@/design-system/theme/theme.environment";
import { themeConfig } from "@/design-system/theme/theme.config";
import { DirectionProvider } from "@/shared/providers/direction-provider";
import { ThemeProvider } from "@/shared/providers/theme-provider";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
  preload: false,
});

const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-kufi-arabic",
  preload: false,
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  preload: false,
});

const alexandria = Alexandria({
  subsets: ["arabic", "latin"],
  variable: "--font-alexandria",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: dashboardCopy.app.name,
    template: `%s | ${dashboardCopy.app.name}`,
  },
  description: dashboardCopy.app.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={dashboardCopy.app.language}
      dir={themeConfig.layout.direction}
      className={`${cairo.variable} ${montserrat.variable} ${tajawal.variable} ${notoKufiArabic.variable} ${amiri.variable} ${alexandria.variable}`}
      style={getThemeCustomProperties(serverEnv)}
    >
      <body>
        <ThemeProvider>
          <DirectionProvider direction={themeConfig.layout.direction}>
            {children}
          </DirectionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
