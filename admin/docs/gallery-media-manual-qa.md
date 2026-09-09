# Gallery Media — Manual QA

## Status

Manual QA pending. A prior attempt reported an unclear upload/list flow; retest is required after the Server Action FormData boundary correction.

## List

- [ ] Grid and RTL layout on desktop and mobile.
- [ ] Images and videos filters; pagination; empty and service-error states.
- [ ] A broken or missing media URL uses a placeholder without breaking the card.

## Upload

- [ ] Upload an allowed image and video, singly and in a mixed selection.
- [ ] Reject SVG, audio, documents, empty files, files above 200MB, and duplicates.
- [ ] Remove one selected file and remove all.
- [ ] Verify sequential upload status, partial failure, retry of failed items only, and duplicate-submit prevention.

## Preview and delete

- [ ] Image and video preview; keyboard dialog close and focus restoration.
- [ ] Video controls, mobile playback, unavailable media fallback.
- [ ] Cancel and confirm deletion; loading, success, 404, 403, and server-error responses.

## Permissions and network

- [ ] Admin and `gallery.manage` actor access; no-permission, missing-session, and inactive actor behavior.
- [ ] GET, POST, and DELETE use `/api/admin/gallery-media` through the existing BFF/server client.
- [ ] Media requests return 200/206 and the console has no errors.
