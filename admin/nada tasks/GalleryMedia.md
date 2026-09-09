# GalleryMedia

## Scope

GalleryMedia is an admin-only flat media library. It is separate from the legacy `Galleries` resource and has no public item detail endpoint, `section_id`, or `views_count`.

### GET /api/admin/gallery-media

#### Route

`GET /api/admin/gallery-media`

#### Purpose

List gallery media records, optionally filtered by media type.

#### Auth

Bearer token required.

#### Allowed Roles

Admin only.

#### Required Permission

Authenticated user must pass the `admin` middleware.

#### Content-Type

None.

#### Path Params

None.

#### Query Params

| Name | Type | Required | Notes |
|---|---|---|---|
| `type` | string | No | Filters by `image` or `video`. |
| `page` | integer | No | Laravel pagination page number. |
| `per_page` | integer | No | Pagination size; defaults to `24`. |

#### Request Body

No request body.

#### Example Request

```http
GET /api/admin/gallery-media?type=image&page=1&per_page=24
Authorization: Bearer {token}
```

#### Success Response

```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "type": "image",
      "path": "gallery/images/example.webp",
      "url": "https://example.test/storage/gallery/images/example.webp",
      "original_name": "example.webp",
      "mime_type": "image/webp",
      "size": 12345,
      "uploaded_by": 7
    }
  ],
  "per_page": 24,
  "total": 1
}
```

#### Error Responses

401:

```json
{
  "message": "Unauthenticated."
}
```

403:

```json
{
  "message": "Unauthorized. Admin access required."
}
```

#### Frontend Notes

`path` is a relative public-storage path, not an absolute server filesystem path. Public files are served through `/storage`. Listing media does not increment a view counter.

### POST /api/admin/gallery-media

#### Route

`POST /api/admin/gallery-media`

#### Purpose

Upload one or more files to the admin gallery media library.

#### Auth

Bearer token required.

#### Allowed Roles

Admin only.

#### Required Permission

Authenticated user must pass the `admin` middleware.

#### Content-Type

`multipart/form-data`

#### Path Params

None.

#### Query Params

None.

#### Request Body

| Field | Type | Required | Notes |
|---|---|---|---|
| `files[]` | file array | Yes | At least one file; each file must be no larger than `204800` KB (200 MB). |

Allowed image MIME types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/avif`, `image/bmp`, `image/heic`, `image/heif`.

Allowed video MIME types: `video/mp4`, `video/x-m4v`, `video/quicktime`, `video/webm`, `video/x-msvideo`, `video/x-matroska`, `video/ogg`, `video/3gpp`.

Files with any other detected MIME type, including HTML, JavaScript, SVG, or executable content, are rejected by validation.

#### Example Request

```text
POST /api/admin/gallery-media
Authorization: Bearer {token}
Content-Type: multipart/form-data

files[]=@image.webp
files[]=@clip.webm
```

#### Success Response

```json
{
  "message": "Gallery media uploaded successfully",
  "items": [
    {
      "id": 1,
      "type": "image",
      "path": "gallery/images/image.webp",
      "url": "https://example.test/storage/gallery/images/image.webp",
      "original_name": "image.webp",
      "mime_type": "image/webp",
      "size": 12345,
      "uploaded_by": 7
    }
  ]
}
```

#### Error Responses

401:

```json
{
  "message": "Unauthenticated."
}
```

403:

```json
{
  "message": "Unauthorized. Admin access required."
}
```

422:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "files": [
      "The files field is required."
    ],
    "files.0": [
      "Each file must be an allowed image or video type."
    ]
  }
}
```

#### Frontend Notes

Use the exact repeated field name `files[]`. The backend detects the stored record type from the uploaded file MIME type and stores files on the public disk. There is no public GalleryMedia detail route or view counter.

### DELETE /api/admin/gallery-media/{galleryMedia}

#### Route

`DELETE /api/admin/gallery-media/{galleryMedia}`

#### Purpose

Delete one gallery media record and its stored file.

#### Auth

Bearer token required.

#### Allowed Roles

Admin only.

#### Required Permission

Authenticated user must pass the `admin` middleware.

#### Content-Type

None.

#### Path Params

| Name | Type | Required | Notes |
|---|---|---|---|
| `galleryMedia` | integer | Yes | ID of the GalleryMedia record. |

#### Query Params

None.

#### Request Body

No request body.

#### Example Request

```http
DELETE /api/admin/gallery-media/1
Authorization: Bearer {token}
```

#### Success Response

```json
{
  "message": "Gallery media deleted successfully"
}
```

#### Error Responses

401:

```json
{
  "message": "Unauthenticated."
}
```

403:

```json
{
  "message": "Unauthorized. Admin access required."
}
```

404:

```json
{
  "message": "Not Found"
}
```

#### Frontend Notes

On success, the controller deletes the file from the public storage disk and then deletes the database row. This endpoint affects only GalleryMedia and does not affect legacy Galleries or public view counters.

## Known Limitations

GalleryMedia has no public detail endpoint and is not a content resource with sections or views.
