# ViewCounter

## Scope

ViewCounter is shared backend behavior on public content detail endpoints. It is not a standalone CRUD module and there is no standalone `/views` endpoint.

### GET /api/articles/{id}

#### Route

`GET /api/articles/{id}`

#### Purpose

Return one public article and record a view when the browser has not viewed that article within the current 24-hour window.

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
| `id` | integer | Yes | Article ID. |

#### Query Params

None.

#### Request Body

No request body.

#### Example Request

```http
GET /api/articles/1
```

#### Success Response

```json
{
  "article": {
    "id": 1,
    "views_count": 1
  }
}
```

#### View Counter Behavior

The backend increments the article's `views_count` at most once per browser per 24 hours. Article list requests and admin article requests do not increment this counter.

#### Cookie Behavior

When the view is counted, the response sets `cms_viewed_article_1` with value `1`. The cookie lifetime is 1440 minutes (24 hours), path `/`, `SameSite=Lax`, and it is secure in production. It is non-HttpOnly and contains no user ID, IP address, device ID, or personal data.

#### Error Responses

404:

```json
{
  "message": "Not Found"
}
```

#### Frontend Notes

Do not increment `views_count` in frontend code. Treat the returned value as the source of truth, and do not delete or manipulate the view cookie. A refresh within 24 hours from the same browser does not add another view.

### GET /api/library/books/{id}

#### Route

`GET /api/library/books/{id}`

#### Purpose

Return one public book and record a view when the browser has not viewed that book within the current 24-hour window.

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
| `id` | integer | Yes | Book ID. |

#### Query Params

None.

#### Request Body

No request body.

#### Example Request

```http
GET /api/library/books/1
```

#### Success Response

```json
{
  "book": {
    "id": 1,
    "views_count": 1
  }
}
```

#### View Counter Behavior

The backend increments the book's `views_count` at most once per browser per 24 hours. Book list requests and admin book requests do not increment this counter.

#### Cookie Behavior

When the view is counted, the response sets `cms_viewed_book_1` with value `1`. The cookie lifetime is 1440 minutes (24 hours), path `/`, `SameSite=Lax`, and it is secure in production. It is non-HttpOnly and contains no user ID, IP address, device ID, or personal data.

#### Error Responses

404:

```json
{
  "message": "Book not found"
}
```

#### Frontend Notes

Do not increment `views_count` in frontend code. Treat the returned value as the source of truth, and do not delete or manipulate the view cookie. A new browser or an expired cookie may count a later view.

### GET /api/visuals/{visual}

#### Route

`GET /api/visuals/{visual}`

#### Purpose

Return one public visual and record a view when the browser has not viewed that visual within the current 24-hour window.

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
| `visual` | integer | Yes | Visual ID. |

#### Query Params

None.

#### Request Body

No request body.

#### Example Request

```http
GET /api/visuals/1
```

#### Success Response

```json
{
  "id": 1,
  "views_count": 1
}
```

#### View Counter Behavior

The backend increments the visual's `views_count` at most once per browser per 24 hours. Visual list requests and admin visual requests do not increment this counter.

#### Cookie Behavior

When the view is counted, the response sets `cms_viewed_visual_1` with value `1`. The cookie lifetime is 1440 minutes (24 hours), path `/`, `SameSite=Lax`, and it is secure in production. It is non-HttpOnly and contains no user ID, IP address, device ID, or personal data.

#### Error Responses

404:

```json
{
  "message": "Not Found"
}
```

#### Frontend Notes

Do not increment `views_count` in frontend code. Treat the returned value as the source of truth, and do not delete or manipulate the view cookie. A repeated refresh within 24 hours from the same browser does not increase the counter.

### GET /api/galleries/{gallery}

#### Route

`GET /api/galleries/{gallery}`

#### Purpose

Return one public legacy Gallery and record a view when the browser has not viewed that Gallery within the current 24-hour window.

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
| `gallery` | integer | Yes | Gallery ID. |

#### Query Params

None.

#### Request Body

No request body.

#### Example Request

```http
GET /api/galleries/1
```

#### Success Response

```json
{
  "id": 1,
  "views_count": 1
}
```

#### View Counter Behavior

The backend increments the legacy Gallery's `views_count` at most once per browser per 24 hours. Gallery list requests and admin Gallery requests do not increment this counter.

#### Cookie Behavior

When the view is counted, the response sets `cms_viewed_gallery_1` with value `1`. The cookie lifetime is 1440 minutes (24 hours), path `/`, `SameSite=Lax`, and it is secure in production. It is non-HttpOnly and contains no user ID, IP address, device ID, or personal data.

#### Error Responses

404:

```json
{
  "message": "Not Found"
}
```

#### Frontend Notes

This endpoint belongs to the legacy `Galleries` resource. Do not increment `views_count` in frontend code or manipulate the view cookie. GalleryMedia is a separate admin media library and has no view counter.

## Non-counted Requests

List endpoints do not increment `views_count`. Admin endpoints do not increment `views_count`. GalleryMedia has no public detail endpoint and no `views_count` field. The frontend should display the value returned by the relevant detail response.
