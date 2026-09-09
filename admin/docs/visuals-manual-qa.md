# Visuals manual QA checklist

## Automated coverage completed

- Input validation for upload/link modes, MIME, size, protocol, media conflicts, and update preservation.
- Repository query construction, multipart uploads, JSON updates, method override, and deletion endpoint.
- Route permission mapping for `visuals.manage`, including nested routes and admin bypass.

## Human QA required

### List

- Open `/dashboard/visuals`; verify Arabic RTL layout, loading, empty/error states, type/section filters, and pagination.
- Confirm no `search` parameter is sent to the backend.
- Check browser console: no client-side errors or ViewCounter/cookie calls.

### Create and edit

- Upload a supported video, then try an unsupported type and a file over 200MB.
- Add HTTP and HTTPS links; reject invalid and empty URLs.
- Test supported/unsupported thumbnails and the 10MB limit.
- Confirm duplicate submission is disabled, 422 field errors appear, and leaving media fields empty on edit preserves existing media.
- Confirm multipart edits use `_method=PUT`; text-only edits use `PUT`.

### Detail and delete

- Verify upload video and external-link previews, missing thumbnails, 404/403 states, and server-provided `views_count`.
- Observe that the documented detail endpoint may increment the count on the backend; the frontend sends no increment request and never reads or changes `cms_viewed_visual_*` cookies.
- Verify cancel, confirm, pending, success, and failure delete states.

### Access

- Verify admin bypass, an active actor with `visuals.manage`, one without it, missing session redirect, and inactive actor behavior.
- Confirm no client cookie/view-counter manipulation and no frontend increment request.
