# Visuals

## Status
Backend closed; ready for frontend integration.

### GET /api/visuals
#### Route
`GET /api/visuals`
#### Purpose
List public visuals.
#### Auth
Public.
#### Allowed Roles
None.
#### Required Permission
None.
#### Content-Type
None.
#### Path Params
None.
#### Query Params
| Name | Type | Required | Notes |
|---|---|---|---|
| section_id | integer | No | Filter section |
| author | integer | No | Filter owner user ID |
| type | string | No | Filter visual type |
| page | integer | No | Pagination page |
#### Request Body
No request body.
#### Example Request
`GET /api/visuals?section_id=2&type=upload&page=1`
#### Success Response
```json
{"current_page":1,"data":[{"id":3,"title":"Clip","type":"upload","views_count":0}],"per_page":15,"total":1}
```
#### Error Responses
None.
#### Frontend Notes
The list does not increment views_count.

### GET /api/visuals/{visual}
#### Route
`GET /api/visuals/{visual}`
#### Purpose
Return one visual with section and owner data.
#### Auth
Public.
#### Allowed Roles
None.
#### Required Permission
None.
#### Content-Type
None.
#### Path Params
| Name | Type | Required | Notes |
|---|---|---|---|
| visual | integer | Yes | Visual ID |
#### Query Params
None.
#### Request Body
No request body.
#### Example Request
`GET /api/visuals/3`
#### Success Response
```json
{"id":3,"title":"Clip","type":"link","url":"https://example.com/video","views_count":1,"section":null}
```
#### Error Responses
```json
{"message":"Not Found"}
```
#### Frontend Notes
The first browser detail view increments views_count and sets the visual view cookie; repeated views within 24 hours do not increment.

### POST /api/visuals
#### Route
`POST /api/visuals`
#### Purpose
Create an upload or external-link visual.
#### Auth
Bearer token required.
#### Allowed Roles
Admin.
#### Required Permission
Admin middleware.
#### Content-Type
`multipart/form-data` for files or `application/json` for link data.
#### Path Params
None.
#### Query Params
None.
#### Request Body
| Field | Type | Required | Notes |
|---|---|---|---|
| title | string | Yes | Max 255 |
| description | string | No | |
| type | string | Yes | `upload` or `link` |
| file | file | Conditional | Required for upload; mp4/m4v/mov/webm/avi/mkv/ogv/3gp; max 200MB |
| url | string | Conditional | Required for link; http/https only |
| thumbnail | file | No | jpg/jpeg/png/webp/avif; max 10MB |
| section_id | integer/string | No | visuals module or legacy null module; name is resolved |
| keywords | string | No | |
| rating | number | No | 0 through 5 |
#### Example Request
`multipart/form-data: title=Clip, type=upload, file=@clip.webm, thumbnail=@thumb.webp`
#### Success Response
```json
{"message":"Visual created successfully","visual":{"id":3,"title":"Clip","type":"upload","file_path":"https://example.test/storage/visuals/videos/clip.webm","thumbnail":"https://example.test/storage/visuals/thumbnails/thumb.webp"}}
```
#### Error Responses
```json
{"message":"Unauthenticated."}
```
```json
{"message":"Unauthorized. Admin access required."}
```
```json
{"message":"The given data was invalid.","errors":{"file":["The file field is required."]}}
```
#### Frontend Notes
Use `url` for link visuals and `file` for upload visuals; javascript/data URLs are rejected.

### PUT /api/visuals/{visual}
#### Route
`PUT /api/visuals/{visual}`
#### Purpose
Update a visual and optionally replace its uploaded files.
#### Auth
Bearer token required.
#### Allowed Roles
Admin.
#### Required Permission
Admin middleware.
#### Content-Type
`application/json` or `multipart/form-data`.
#### Path Params
| Name | Type | Required | Notes |
|---|---|---|---|
| visual | integer | Yes | Visual ID |
#### Query Params
None.
#### Request Body
| Field | Type | Required | Notes |
|---|---|---|---|
| title | string | No | Max 255 |
| description | string | No | |
| type | string | No | upload or link |
| file | file | No | Video types listed above; max 200MB |
| url | string | No | http/https URL |
| thumbnail | file | No | jpg/jpeg/png/webp/avif; max 10MB |
| section_id | integer/string | No | visuals or legacy null module |
| keywords | string | No | |
| rating | number | No | 0 through 5 |
#### Example Request
`{"title":"Updated clip"}`
#### Success Response
```json
{"message":"Visual updated successfully","visual":{"id":3,"title":"Updated clip","type":"link"}}
```
#### Error Responses
```json
{"message":"Not Found"}
```
```json
{"message":"The given data was invalid.","errors":{"url":["The url format is invalid."]}}
```
#### Frontend Notes
Uploading a replacement file or thumbnail removes the previous stored file.

### POST /api/visuals/{visual}
#### Route
`POST /api/visuals/{visual}`
#### Purpose
Multipart method-override-compatible visual update.
#### Auth
Bearer token required.
#### Allowed Roles
Admin.
#### Required Permission
Admin middleware.
#### Content-Type
`multipart/form-data`.
#### Path Params
| Name | Type | Required | Notes |
|---|---|---|---|
| visual | integer | Yes | Visual ID |
#### Query Params
None.
#### Request Body
| Field | Type | Required | Notes |
|---|---|---|---|
| _method | string | Yes for override | PUT |
| title | string | No | Max 255 |
| type | string | No | upload or link |
| file | file | No | Allowed video types; max 200MB |
| url | string | No | http/https URL |
| thumbnail | file | No | Allowed image types; max 10MB |
| section_id | integer/string | No | visuals or legacy null module |
#### Example Request
`multipart/form-data: _method=PUT, title=Updated, file=@clip.mp4`
#### Success Response
```json
{"message":"Visual updated successfully","visual":{"id":3,"title":"Updated"}}
```
#### Error Responses
```json
{"message":"Unauthenticated."}
```
```json
{"message":"The given data was invalid.","errors":{"file":["The file type is invalid."]}}
```
#### Frontend Notes
Use this POST route when the client needs multipart method override.

### DELETE /api/visuals/{visual}
#### Route
`DELETE /api/visuals/{visual}`
#### Purpose
Delete a visual and its stored file and thumbnail.
#### Auth
Bearer token required.
#### Allowed Roles
Admin.
#### Required Permission
Admin middleware.
#### Content-Type
None.
#### Path Params
| Name | Type | Required | Notes |
|---|---|---|---|
| visual | integer | Yes | Visual ID |
#### Query Params
None.
#### Request Body
No request body.
#### Example Request
`DELETE /api/visuals/3` with `Authorization: Bearer {token}`
#### Success Response
```json
{"message":"Visual deleted successfully"}
```
#### Error Responses
```json
{"message":"Unauthenticated."}
```
```json
{"message":"Not Found"}
```
#### Frontend Notes
The controller deletes both stored file paths before deleting the database row.
