import { z } from "zod";

const hexColor = z
  .string()
  .trim()
  .regex(/^#[0-9A-Fa-f]{6}$/, "must be a six-digit HEX color");

const booleanFlag = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

const enabledBooleanFlag = z
  .enum(["true", "false"])
  .default("true")
  .transform((value) => value === "true");

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map((index) =>
    Number.parseInt(hex.slice(index, index + 2), 16),
  );
  const [red = 0, green = 0, blue = 0] = channels.map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(left: string, right: string): number {
  const first = relativeLuminance(left);
  const second = relativeLuminance(right);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

const serverEnvironmentSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    APP_ENV: z.string().trim().min(1).optional(),
    DASHBOARD_ORIGIN: z
      .string()
      .trim()
      .url()
      .refine((value) => {
        const url = new URL(value);
        return (
          (url.protocol === "http:" || url.protocol === "https:") &&
          url.username === "" &&
          url.password === "" &&
          (url.pathname === "/" || url.pathname === "") &&
          url.search === "" &&
          url.hash === ""
        );
      }, "must be an http(s) origin without a path, credentials, query, or hash")
      .transform((value) => new URL(value).origin)
      .optional(),
    PUBLIC_FRONTEND_ORIGIN: z
      .string()
      .trim()
      .url()
      .refine((value) => {
        try {
          const url = new URL(value);
          return (
            (url.protocol === "http:" || url.protocol === "https:") &&
            url.username === "" &&
            url.password === "" &&
            (url.pathname === "/" || url.pathname === "") &&
            url.search === "" &&
            url.hash === ""
          );
        } catch {
          return false;
        }
      }, "must be an http(s) origin without a path, credentials, query, or hash")
      .transform((value) => new URL(value).origin)
      .optional(),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
    SESSION_SECRET: z.string().trim().min(1).optional(),
    SESSION_IDLE_TIMEOUT_MINUTES: z.coerce
      .number()
      .int()
      .positive()
      .default(30),
    SESSION_ABSOLUTE_TIMEOUT_HOURS: z.coerce
      .number()
      .int()
      .positive()
      .default(8),
    BACKEND_API_URL: z
      .string()
      .trim()
      .url()
      .refine((value) => {
        const protocol = new URL(value).protocol;

        return protocol === "http:" || protocol === "https:";
      }, "must use the http or https protocol")
      .optional(),
    DASHBOARD_MODULE_ARTICLES_ENABLED: enabledBooleanFlag,
    DASHBOARD_MODULE_PAGES_ENABLED: booleanFlag,
    DASHBOARD_MODULE_SECTIONS_ENABLED: enabledBooleanFlag,
    DASHBOARD_MODULE_GOVERNANCE_ENABLED: enabledBooleanFlag,
    DASHBOARD_MODULE_PROGRAMS_ENABLED: enabledBooleanFlag,
    DASHBOARD_MODULE_APPLICATIONS_ENABLED: enabledBooleanFlag,
    DASHBOARD_MODULE_FEEDBACK_ENABLED: enabledBooleanFlag,
    DASHBOARD_MODULE_GALLERY_MEDIA_ENABLED: enabledBooleanFlag,
    DASHBOARD_MODULE_LEGACY_VISUALS_ENABLED: enabledBooleanFlag,
    DASHBOARD_MODULE_LIBRARY_ENABLED: booleanFlag,
    DASHBOARD_MODULE_DISSERTATIONS_ENABLED: booleanFlag,
    DASHBOARD_MODULE_LISTENING_ENABLED: booleanFlag,
    DASHBOARD_MODULE_HADITH_CARDS_ENABLED: booleanFlag,
    DASHBOARD_MODULE_SCIENTIFIC_FATWAS_ENABLED: booleanFlag,
    DASHBOARD_MODULE_SCIENTIFIC_VIDEOS_ENABLED: booleanFlag,
    DASHBOARD_MODULE_LIBRARY_INDEXES_ENABLED: booleanFlag,
    DASHBOARD_MODULE_COMMENTS_ENABLED: booleanFlag,
    DASHBOARD_MODULE_TOUR_GUIDES_ENABLED: booleanFlag,
    THEME_COLOR_GOLD: hexColor.default("#D9BB5D"),
    THEME_COLOR_BROWN: hexColor.default("#937133"),
    THEME_COLOR_DARK_TEAL: hexColor.default("#2B393A"),
    THEME_COLOR_TEAL: hexColor.default("#1B3A36"),
    THEME_COLOR_GREEN: hexColor.default("#156D54"),
    THEME_COLOR_DARK_GREEN: hexColor.default("#01231C"),
  })
  .superRefine((environment, context) => {
    if (
      environment.DASHBOARD_MODULE_PAGES_ENABLED &&
      environment.PUBLIC_FRONTEND_ORIGIN === undefined
    ) {
      context.addIssue({
        code: "custom",
        path: ["PUBLIC_FRONTEND_ORIGIN"],
        message: "is required when the Pages dashboard module is enabled",
      });
    }

    const pairs = [
      {
        path: "THEME_COLOR_GREEN",
        foreground: environment.THEME_COLOR_GREEN,
        background: "#FFFFFF",
      },
      {
        path: "THEME_COLOR_GOLD",
        foreground: environment.THEME_COLOR_GOLD,
        background: environment.THEME_COLOR_DARK_GREEN,
      },
    ] as const;

    for (const pair of pairs) {
      if (contrastRatio(pair.foreground, pair.background) < 4.5) {
        context.addIssue({
          code: "custom",
          path: [pair.path],
          message: "must keep a WCAG AA contrast ratio of at least 4.5:1",
        });
      }
    }
  });

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

export function validateServerEnvironment(
  environment: Record<string, string | undefined> = process.env,
): ServerEnvironment {
  const result = serverEnvironmentSchema.safeParse(environment);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(`Invalid server environment configuration:\n${issues}`);
  }

  return result.data;
}
