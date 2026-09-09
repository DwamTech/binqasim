import type { CSSProperties } from "react";

import { clientEnv } from "@/core/env/client";
import type { ServerEnvironment } from "@/core/env/server";

type ThemeCustomProperties = CSSProperties &
  Record<`--${string}`, string | number>;

const fontPresets = {
  "cairo-montserrat":
    'var(--font-cairo), var(--font-montserrat), "Cairo", "Montserrat", sans-serif',
  cairo: 'var(--font-cairo), "Cairo", sans-serif',
  montserrat: 'var(--font-montserrat), "Montserrat", sans-serif',
} as const;

export function getThemeCustomProperties(
  environment: ServerEnvironment,
): ThemeCustomProperties {
  return {
    "--color-gold": environment.THEME_COLOR_GOLD,
    "--color-brown": environment.THEME_COLOR_BROWN,
    "--color-dark-teal": environment.THEME_COLOR_DARK_TEAL,
    "--color-teal": environment.THEME_COLOR_TEAL,
    "--color-green": environment.THEME_COLOR_GREEN,
    "--color-dark-green": environment.THEME_COLOR_DARK_GREEN,
    "--font-main": fontPresets[clientEnv.NEXT_PUBLIC_FONT_PRESET],
  };
}
