# Dashboard customization

The dashboard is configured at build time from the environment variables in
the project root. Start by copying `.env.example` to `.env.local`; never place
secrets in variables prefixed with `NEXT_PUBLIC_`.

## Brand and theme

- `NEXT_PUBLIC_APP_NAME` and `NEXT_PUBLIC_APP_SHORT_NAME` control the product
  name shown in metadata, login, and the sidebar.
- `NEXT_PUBLIC_BRAND_*` values are root-relative files inside `public/`.
- `NEXT_PUBLIC_LOGIN_SHOWCASE_TITLE` and `NEXT_PUBLIC_LOGIN_SHOWCASE_LOGO`
  control the title and logo displayed in the login-page showcase.
- `THEME_COLOR_*` values are the six seed colors used to derive the semantic
  dashboard colors. They must be quoted six-digit HEX colors because an
  unquoted `#` starts a dotenv comment.
- `NEXT_PUBLIC_FONT_PRESET` accepts `cairo-montserrat`, `cairo`, or
  `montserrat`.

Components must use semantic tokens such as `--color-primary`,
`--color-surface`, and `--color-border`. Do not copy brand HEX or RGB values
into feature CSS.

## Arabic module labels

Each module has a complete navigation label and singular/plural entity names:

```env
NEXT_PUBLIC_NAV_BOOKS=إدارة الكتب
NEXT_PUBLIC_ENTITY_BOOK_SINGULAR=الكتاب
NEXT_PUBLIC_ENTITY_BOOK_PLURAL=الكتب
```

The navigation label is reused by the desktop and mobile sidebar, breadcrumbs,
page hero, permission catalog, quick links, and browser metadata. Create, edit,
and detail titles are derived from the singular entity label.

Routes, permission keys, API names, and module IDs are intentionally not
configurable. They are technical contracts and must remain stable when display
copy changes.

The six deployment-controlled public-site modules use one label each across the
sidebar, page hero, metadata, breadcrumbs, settings, and dashboard quick links:

```env
NEXT_PUBLIC_DASHBOARD_MODULE_ARTICLES_LABEL=المقالات والدراسات
NEXT_PUBLIC_DASHBOARD_MODULE_LIBRARY_LABEL=المصنَّفات والمكتبة الرقمية
NEXT_PUBLIC_DASHBOARD_MODULE_DISSERTATIONS_LABEL=الإنتاج الأكاديمي والإشراف العلمي
NEXT_PUBLIC_DASHBOARD_MODULE_LISTENING_LABEL=مجالس السماع والمواد الصوتية
NEXT_PUBLIC_DASHBOARD_MODULE_SCIENTIFIC_FATWAS_LABEL=الفتاوى والمسائل الحديثة
NEXT_PUBLIC_DASHBOARD_MODULE_SCIENTIFIC_VIDEOS_LABEL=المرئيات واللقاءات العلمية
```

These public labels are intentionally separate from the server-only
`DASHBOARD_MODULE_*_ENABLED` switches. A switch controls whether a route exists
in a deployment; its matching label controls only presentation. Existing
deployments that omit the new labels keep the previous copy through defaults.

## Applying changes

During development, restart `next dev` after changing `.env.local`. Public
variables are embedded by Next.js during `next build`, so production
customization requires a new build.

Before publishing a customized theme, run:

```text
npm run test
npm run typecheck
npm run lint
npm run build
```

Also inspect light/dark mode, focus states, tables, dialogs, dropdowns, and
mobile navigation to confirm sufficient color contrast.

## Responsive tables

Every dashboard table uses the shared responsive-table contract:

```tsx
<div className="ui-responsive-table-wrap">
  <table className="ui-responsive-table">
    <thead>{/* accessible column headings */}</thead>
    <tbody>
      <tr>
        <td data-label="العنوان">{/* cell value */}</td>
      </tr>
    </tbody>
  </table>
</div>
```

The wrapper is a CSS size container. When its available width can no longer
fit the table, each row becomes a modern card and horizontal scrolling is
disabled. Every new body cell must have a `data-label` matching its column
heading; an automated test protects this contract.
