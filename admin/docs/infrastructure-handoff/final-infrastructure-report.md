# CMS Dashboard Core — Infrastructure Handoff

## Scope and architecture

The infrastructure layer provides typed environment validation, domain contracts,
application use cases, a central server API client, BFF routes, server-side session
management, DAL guards, authorization, safe redirects, and security middleware.
Presentation components do not own backend requests, cookies, sessions, or tokens.

## Authentication and session boundary

- `POST /api/auth/login` authenticates through the server-side adapter and sets the
  HTTP-only `cms_session` cookie.
- `POST /api/auth/logout` revokes the session and clears that cookie.
- `GET /api/auth/session`, `POST /api/auth/refresh`, and `GET /api/health` expose
  the approved BFF/health boundaries.
- Session cookie serialization, session-manager lifecycle, rotation, stores, DAL
  verification, and `requireAdmin` / `requireGuest` remain server-owned.
- Browser-facing login/logout adapters live in the App integration boundary; UI
  receives typed callbacks and never reads client cookies or tokens.

## Configuration

`.env.example` documents server-only API/session settings and public application
metadata. `src/core/env/server.schema.ts` and `src/core/env/client.ts` validate
their respective boundaries. No secrets are exposed with a `NEXT_PUBLIC_` prefix.

The App root mounts the approved design-system global styles and RTL/theme
providers. It uses the system font stack from the design-system theme rather than
`next/font/google`, making production builds deterministic without font-network
access.

## Replaceable backend limitation

The BFF needs a configured reachable backend for live authentication. In its
absence it returns a safe unavailable response; no production auth bypass or fake
session is supplied. In-memory session adapters are limited to test/development
runtime paths permitted by the infrastructure specification.

This live-backend requirement is the only remaining external E2E integration
limitation; there are no code-level blockers.

## Verification and tests

Focused tests cover environment validation, API result mapping, BFF routes,
session cookies/manager/DAL, authorization, route policy, security middleware,
and integration adapters. Run `npm run typecheck`, `npm run lint`, `npm run test`,
`npm run format:check`, and `npm run build` before release.

## Integration ownership

Infrastructure owns API routes, proxy/route policy, security headers, server
configuration, and real backend connectivity. UI integration owns callback wiring
only; it must not duplicate server/session behavior.
