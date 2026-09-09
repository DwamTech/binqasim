# Sections

## Scope

Sections are module-scoped content sections. Supported modules are `articles`, `books`, `visuals`, `galleries`, and `gallery_media`. Existing legacy sections with `module=null` remain valid for content that supports legacy sections. There is no Category model and no nested-section API.

### GET /api/sections

#### Route

`GET /api/sections`

#### Purpose

Return active sections for public frontend navigation and filtering.

#### Auth

Public. No bearer token required.

#### Allowed Roles

All visitors.

#### Required Permission

None.

#### Content-Type

None.

#### Path Params

None.

#### Query Params

| Name | Type | Required | Notes |
|---|---|---|---|
| `module` | string | No | Filters by `articles`, `books`, `visuals`, `galleries`, or `gallery_media`. |

#### Request Body

No request body.

#### Example Request

```http
GET /api/sections?module=books
```

#### Success Response

```json
[
  {
    "id": 2,
    "name": "Books",
    "slug": "books",
    "module": "books",
    "description": "Book sections",
    "is_active": true,
    "user_id": 1
  }
]
```

#### Error Responses

None. The controller applies the optional module filter without request validation.

#### Frontend Notes

Only records with `is_active=true` are returned. An omitted module returns active sections across modules, including records whose legacy `module` is `null`.

### GET /api/sections/{id}

#### Route

`GET /api/sections/{id}`

#### Purpose

Return one active public section.

#### Auth

Public. No bearer token required.

#### Allowed Roles

All visitors.

#### Required Permission

None.

#### Content-Type

None.

#### Path Params

| Name | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | Yes | ID of the section. |

#### Query Params

None.

#### Request Body

No request body.

#### Example Request

```http
GET /api/sections/2
```

#### Success Response

```json
{
  "id": 2,
  "name": "Books",
  "slug": "books",
  "module": "books",
  "description": "Book sections",
  "is_active": true,
  "user_id": 1
}
```

#### Error Responses

404:

```json
{
  "message": "No query results for model [App\\Models\\Section]."
}
```

#### Frontend Notes

Inactive sections are treated as not found by this public endpoint.

### GET /api/admin/sections

#### Route

`GET /api/admin/sections`

#### Purpose

List sections for the admin section manager.

#### Auth

Bearer token required.

#### Allowed Roles

Active admin only.

#### Required Permission

Authenticated user must pass the `admin` middleware.

#### Content-Type

None.

#### Path Params

None.

#### Query Params

| Name | Type | Required | Notes |
|---|---|---|---|
| `module` | string | No | Filters by the supplied module value. |
| `search` | string | No | Filters section names with a partial match. |
| `page` | integer | No | Laravel pagination page number. |

#### Request Body

No request body.

#### Example Request

```http
GET /api/admin/sections?module=articles&search=news&page=1
Authorization: Bearer {token}
```

#### Success Response

```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "name": "News",
      "slug": "news",
      "module": "articles",
      "description": null,
      "is_active": true,
      "user_id": 1
    }
  ],
  "per_page": 20,
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

Admin pagination defaults to 20 items per page. The backend does not validate the optional module filter on this listing endpoint.

### POST /api/admin/sections

#### Route

`POST /api/admin/sections`

#### Purpose

Create a module-scoped section.

#### Auth

Bearer token required.

#### Allowed Roles

Active admin only.

#### Required Permission

Authenticated user must pass the `admin` middleware.

#### Content-Type

`application/json`

#### Path Params

None.

#### Query Params

None.

#### Request Body

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | Yes | Maximum 255 characters; unique within the selected module. |
| `module` | string | Yes | Must be `articles`, `books`, `visuals`, `galleries`, or `gallery_media`. |
| `description` | string or null | No | Nullable section description. |
| `is_active` | boolean | No | Section active state. |

#### Example Request

```json
{
  "name": "News",
  "module": "articles",
  "description": "Article news sections",
  "is_active": true
}
```

#### Success Response

```json
{
  "message": "Section created successfully",
  "section": {
    "id": 1,
    "name": "News",
    "slug": "news",
    "module": "articles",
    "description": "Article news sections",
    "is_active": true,
    "user_id": 1
  }
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
    "module": [
      "The selected module is invalid."
    ]
  }
}
```

#### Frontend Notes

Do not send `slug`; the backend generates it from `name`. Name uniqueness is scoped per module, so the same name may exist in different modules. Existing legacy `module=null` sections remain supported, but new sections require one of the allowed module values.

### GET /api/admin/sections/{section}

#### Route

`GET /api/admin/sections/{section}`

#### Purpose

Return one section for admin management.

#### Auth

Bearer token required.

#### Allowed Roles

Active admin only.

#### Required Permission

Authenticated user must pass the `admin` middleware.

#### Content-Type

None.

#### Path Params

| Name | Type | Required | Notes |
|---|---|---|---|
| `section` | integer | Yes | ID of the section. |

#### Query Params

None.

#### Request Body

No request body.

#### Example Request

```http
GET /api/admin/sections/1
Authorization: Bearer {token}
```

#### Success Response

```json
{
  "id": 1,
  "name": "News",
  "slug": "news",
  "module": "articles",
  "description": "Article news sections",
  "is_active": true,
  "user_id": 1
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

The route uses implicit model binding and returns a JSON section record when the ID exists.

### PUT /api/admin/sections/{section}

#### Route

`PUT /api/admin/sections/{section}`

#### Purpose

Replace or update section attributes through the PUT route.

#### Auth

Bearer token required.

#### Allowed Roles

Active admin only.

#### Required Permission

Authenticated user must pass the `admin` middleware.

#### Content-Type

`application/json`

#### Path Params

| Name | Type | Required | Notes |
|---|---|---|---|
| `section` | integer | Yes | ID of the section. |

#### Query Params

None.

#### Request Body

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | No | Maximum 255 characters; uniqueness is scoped per module. |
| `module` | string | No | Must be one of the allowed module values when supplied. |
| `description` | string or null | No | Nullable section description. |
| `is_active` | boolean | No | Section active state. |

#### Example Request

```json
{
  "name": "Updated News",
  "is_active": true
}
```

#### Success Response

```json
{
  "message": "Section updated successfully",
  "section": {
    "id": 1,
    "name": "Updated News",
    "slug": "updated-news",
    "module": "articles",
    "description": "Article news sections",
    "is_active": true,
    "user_id": 1
  }
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

422:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "name": [
      "The name has already been taken for this module."
    ]
  }
}
```

#### Frontend Notes

The update accepts partial fields even through PUT. Do not send `slug`; when `name` changes, the backend regenerates `slug` from `name`.

### PATCH /api/admin/sections/{section}

#### Route

`PATCH /api/admin/sections/{section}`

#### Purpose

Partially update section attributes through the PATCH route.

#### Auth

Bearer token required.

#### Allowed Roles

Active admin only.

#### Required Permission

Authenticated user must pass the `admin` middleware.

#### Content-Type

`application/json`

#### Path Params

| Name | Type | Required | Notes |
|---|---|---|---|
| `section` | integer | Yes | ID of the section. |

#### Query Params

None.

#### Request Body

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | No | Maximum 255 characters; uniqueness is scoped per module. |
| `module` | string | No | Must be one of the allowed module values when supplied. |
| `description` | string or null | No | Nullable section description. |
| `is_active` | boolean | No | Section active state. |

#### Example Request

```json
{
  "description": "Updated description"
}
```

#### Success Response

```json
{
  "message": "Section updated successfully",
  "section": {
    "id": 1,
    "name": "News",
    "slug": "news",
    "module": "articles",
    "description": "Updated description",
    "is_active": true,
    "user_id": 1
  }
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

422:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "module": [
      "The selected module is invalid."
    ]
  }
}
```

#### Frontend Notes

Do not send `slug`; the backend preserves it unless `name` is supplied, in which case it regenerates the slug.

### DELETE /api/admin/sections/{section}

#### Route

`DELETE /api/admin/sections/{section}`

#### Purpose

Delete a section that is not referenced by supported content.

#### Auth

Bearer token required.

#### Allowed Roles

Active admin only.

#### Required Permission

Authenticated user must pass the `admin` middleware.

#### Content-Type

None.

#### Path Params

| Name | Type | Required | Notes |
|---|---|---|---|
| `section` | integer | Yes | ID of the section. |

#### Query Params

None.

#### Request Body

No request body.

#### Example Request

```http
DELETE /api/admin/sections/1
Authorization: Bearer {token}
```

#### Success Response

```json
{
  "message": "Section deleted successfully"
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

409:

```json
{
  "message": "Section is currently used by content."
}
```

#### Frontend Notes

Deletion returns 409 when the section is used by an Article, Book, Visual, or legacy Gallery. GalleryMedia currently has no `section_id` relationship checked by this controller.
