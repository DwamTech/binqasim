# Books Foundation — Manual QA

Status: pending manual verification. Use an authenticated admin or supervisor account and browser network tools.

## WIP handoff status

Completed implementation and automated coverage: Books list with supported filters and pagination, the verified `{ book, related_parts }` detail wrapper and related parts, Series list/detail, `books.manage` authorization/navigation, and server-side media resolution.

Still incomplete: human Manual QA, Book Create UI and mutation, metadata-foundation tests, Sections metadata verification, Book edit/delete, uploads, Series create/edit/delete, and backend production blockers. The partial Books metadata groundwork must be reviewed by the Team Leader before it is extended.

## Books list

- [ ] Successful response renders the Arabic books table and accessible detail links.
- [ ] Empty response renders the empty state.
- [ ] `type=single` and `type=part` apply only the supported type filter.
- [ ] Pagination preserves the current type, `section_id`, and `series_id` values.
- [ ] Valid `section_id` and `series_id` URLs are preserved.
- [ ] Invalid type, page, section, and series query values are safely ignored.
- [ ] Loading skeleton appears during navigation.
- [ ] API failure renders a generic Arabic error with no backend detail.

## Book detail

- [ ] Successful response uses the verified `{ book, related_parts }` admin wrapper and renders only supported book fields.
- [ ] Related parts render when present and remain absent when the array is empty.
- [ ] Invalid ID displays the localized not-found state without a request.
- [ ] Backend 404 displays the localized not-found state.
- [ ] Backend 403 renders an authorization error.
- [ ] Other API failures render a generic error.
- [ ] Back navigation returns to Books.

## Series

- [ ] Series list success, empty, and error states render correctly.
- [ ] Series detail success renders the name and optional description.
- [ ] Series detail 404 renders localized not-found.
- [ ] Series detail 403 and other errors render safely.

## Permissions

- [ ] Admin sees and accesses Books navigation.
- [ ] Supervisor with `books.manage` sees and accesses Books navigation.
- [ ] Supervisor without `books.manage` cannot see or access Books routes.
- [ ] Missing or expired session follows the existing authentication flow.
- [ ] Backend Admin-only 403 mismatch is presented safely.

## Security and UI

- [ ] Network shows no public Books list/detail request, rating request, or ViewCounter request.
- [ ] No token, backend origin, or internal storage path is displayed in the browser.
- [ ] Desktop, mobile overflow, RTL, keyboard navigation, focus, empty, loading, and error states are usable.

## Authors metadata

- [x] Authors schema, repository, service, and automated tests are complete.
- [ ] Authors UI is intentionally deferred to Book create/edit forms.
- [x] Authors are metadata only: no Authors CRUD and no admin-books author filter exist.

## Intentionally pending mutation work

- [ ] Book create, edit, delete, file upload, and cover upload.
- [ ] Series create, edit, and delete.

## Known backend behavior

- [ ] Admin detail currently increments `views_count` internally because the backend shares the public detail controller. This is a backend issue and is not worked around by the frontend.
