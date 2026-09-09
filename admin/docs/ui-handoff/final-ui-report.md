# CMS Dashboard Core UI — Final QA and Handoff

## Verdict

**READY FOR PR.**

The redesigned Login, Admin shell, and approved `/ui-03a` QA surface pass the
recorded desktop/mobile visual checks and all automated checks. The QA fixture
has one exact current-page item for `/ui-03a`.

## Components implemented

- Theme, branding configuration, RTL direction, typography, motion, and CSS tokens.
- Button, IconButton, Input, PasswordInput, Checkbox, labels/form helpers, alerts,
  badges, cards, menus, dialogs, tooltips, skeletons, spinners, states, and breadcrumb.
- AuthShell, LoginPageView, LoginForm, AdminShell, AdminSidebar, AdminHeader,
  MobileNavigation, PageContainer, DashboardLandingView, and SessionExpiryDialog.
- Feedback states: LoadingState, PageSkeleton, EmptyState, ErrorState, InlineError,
  and ConfirmDialog.

## Design system and branding

Theme files:

- `src/design-system/styles/theme.css`
- `src/design-system/styles/globals.css`
- `src/design-system/styles/typography.css`
- `src/design-system/styles/animations.css`
- `src/design-system/theme/theme.config.ts`

Change branding by replacing the SVG assets in `public/branding/` and updating
`themeConfig.brand` in `src/design-system/theme/theme.config.ts`.

`src/app/layout.tsx` mounts the global design-system stylesheet,
`ThemeProvider`, and `DirectionProvider` with the configured RTL direction.
Typography now uses the repository-contained system font stack, so production
builds do not depend on Google Fonts network access.

## Authentication presentation flows

Login supports idle, validation, submitting, success, invalid credentials,
disabled account, locked account, rate limited, network error, and server/unknown
error states. The App integration adapter posts to the existing same-origin
`/api/auth/login` BFF, accepts only an HTTP-successful structurally valid
`data.admin` response, then replaces navigation to `/dashboard`.

Logout is injected through `AdminShell`'s typed `onLogout` callback. The protected
integration wrapper posts to the existing same-origin `/api/auth/logout` BFF and
replaces navigation to `/login` only after a successful response. Client UI does
not read or write cookies, tokens, or browser storage.

## Screenshots

- [Login — desktop](screenshots/login-desktop.png)
- [Login — mobile](screenshots/login-mobile.png)
- [QA dashboard — desktop](screenshots/qa-dashboard-desktop.png)
- [QA dashboard — mobile](screenshots/qa-dashboard-mobile.png)
- [Mobile drawer open](screenshots/mobile-drawer-open.png)
- [SessionExpiryDialog — mobile](screenshots/session-dialog-mobile.png)

All screenshots were captured locally from the current implementation using
static QA fixtures only; no credentials, cookies, tokens, or DevTools are shown.

## Manual visual QA

| Check                                                                    | Desktop | Mobile        | Result |
| ------------------------------------------------------------------------ | ------- | ------------- | ------ |
| Login layout, hierarchy, RTL, contrast, and focus visibility             | Pass    | Pass          | PASS   |
| Admin shell, expanded sidebar, header/user area, cards, long Arabic name | Pass    | N/A           | PASS   |
| Responsive layout, stacked cards, readable Arabic copy, usable controls  | N/A     | Pass          | PASS   |
| Horizontal overflow                                                      | N/A     | None detected | PASS   |
| Mobile drawer presentation                                               | N/A     | Pass          | PASS   |
| Dismissible session dialog presentation and viewport fit                 | Pass    | Pass          | PASS   |

## UI-03A interaction QA

| Check                                                                             | Result | Evidence                                                                                    |
| --------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------- |
| Only one current-page item                                                        | PASS   | The current child is the sole link whose href exactly matches `/ui-03a`.                    |
| Parent can be visually active without parent `aria-current`                       | PASS   | Parent item route differs from the current child route; exact-match semantics are retained. |
| Drawer Tab trap                                                                   | PASS   | Last focusable wraps to the close button.                                                   |
| Drawer Shift+Tab trap                                                             | PASS   | Close button wraps to the last navigation link.                                             |
| Escape closes drawer and restores toggle focus                                    | PASS   | Browser interaction check passed.                                                           |
| Backdrop closes drawer and restores toggle focus                                  | PASS   | Browser interaction check passed.                                                           |
| Close button closes drawer and restores toggle focus                              | PASS   | Browser interaction check passed.                                                           |
| Navigation selection closes drawer                                                | PASS   | Browser-level click check passed.                                                           |
| Dismissible dialog exposes supported close control and closes on Escape           | PASS   | Browser interaction check passed.                                                           |
| Non-dismissible dialog hides unsupported close control and remains open on Escape | PASS   | Browser interaction check passed.                                                           |

## Tests and verification

- `npm run typecheck`
- `npm run lint`
- `npm run test` — 29 files / 132 tests
- `npm run format:check`
- `npm run build`

Typecheck, lint, tests, and formatting pass. Production build is expected to
pass when Google Fonts is reachable; an isolated local retry can fail before
compilation because the untouched root layout fetches Geist from Google Fonts.

No additional dependencies were required or added.

## Integration boundaries

- `src/app/(public)/login/_components/login-bff.client.ts`
- `src/app/(public)/login/_components/login-navigation.client.ts`
- `src/app/(protected)/_components/logout-bff.client.ts`
- `src/app/(protected)/_components/protected-admin-shell.tsx`
- `src/shared/components/layout/admin-shell.tsx` (`admin`, optional navigation,
  and required `onLogout` callback)
- `src/shared/components/layout/session-expiry-dialog.tsx` callback props
- `src/shared/providers/theme-provider.tsx` and
  `src/shared/providers/direction-provider.tsx`

## Risks and QA-harness decision

Retain `/ui-03a` temporarily: it is development-only, uses static fixtures, has
no API/auth/session/cookie/token calls, is not linked from product navigation,
and invokes `notFound()` outside development.

Before final production integration, either remove the harness after manual QA or
retain it under the same development-only gate. Its fixture has distinct parent
and child routes, so the exact active child is the only current-page item.

**UI-03A MANUAL QA: PASS**

## Branch readiness

The branch is ready for PR preparation; no code-level UI integration blocker
remains.
