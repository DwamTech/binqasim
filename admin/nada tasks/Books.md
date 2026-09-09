# Books

## Status
Backend closed; ready for frontend integration.

### GET /api/library/books
#### Route
`GET /api/library/books`
#### Purpose
List public books.
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
| series_id | integer | No | Filter series |
| type | string | No | Filter book type |
| page | integer | No | Pagination page |
#### Request Body
No request body.
#### Example Request
`GET /api/library/books?section_id=2&type=part&page=1`
#### Success Response
```json
{"current_page":1,"data":[{"id":1,"title":"Example","type":"part","views_count":0}],"per_page":20,"total":1}
```
#### Error Responses
None.
#### Frontend Notes
`author` and `per_page` are not implemented filters.

### GET /api/library/books/{id}
#### Route
`GET /api/library/books/{id}`
#### Purpose
Return one book and related parts when applicable.
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
| id | integer | Yes | Book ID |
#### Query Params
None.
#### Request Body
No request body.
#### Example Request
`GET /api/library/books/1`
#### Success Response
```json
{"book":{"id":1,"title":"Example","type":"single","views_count":1},"related_parts":[]}
```
#### Error Responses
```json
{"message":"Book not found"}
```
#### Frontend Notes
The first browser detail view increments views_count through ViewCounter.

### POST /api/library/books/{id}/rate
#### Route
`POST /api/library/books/{id}/rate`
#### Purpose
Submit a public book rating.
#### Auth
Public.
#### Allowed Roles
None.
#### Required Permission
None.
#### Content-Type
application/json
#### Path Params
| Name | Type | Required | Notes |
|---|---|---|---|
| id | integer | Yes | Book ID |
#### Query Params
None.
#### Request Body
| Field | Type | Required | Notes |
|---|---|---|---|
| rating | number | Yes | Minimum 1, maximum 5 |
#### Example Request
`{"rating":4}`
#### Success Response
```json
{"message":"Rating submitted successfully","average_rating":4.25}
```
#### Error Responses
```json
{"message":"The given data was invalid.","errors":{"rating":["The rating field is required."]}}
```
```json
{"message":"Book not found"}
```
#### Frontend Notes
Rating increments rating_count and rating_sum.

### GET /api/admin/library/books
#### Route
`GET /api/admin/library/books`
#### Purpose
List books in the admin library.
#### Auth
Bearer token required.
#### Allowed Roles
Admin.
#### Required Permission
Admin middleware.
#### Content-Type
None.
#### Path Params
None.
#### Query Params
| Name | Type | Required | Notes |
|---|---|---|---|
| section_id | integer | No | Filter section |
| series_id | integer | No | Filter series |
| type | string | No | Filter type |
| page | integer | No | Pagination page |
#### Request Body
No request body.
#### Example Request
`GET /api/admin/library/books?page=1` with `Authorization: Bearer {token}`
#### Success Response
```json
{"current_page":1,"data":[{"id":1,"title":"Example"}],"per_page":20,"total":1}
```
#### Error Responses
```json
{"message":"Unauthenticated."}
```
```json
{"message":"Unauthorized. Admin access required."}
```
#### Frontend Notes
The admin resource uses the same BookController index response shape.

### POST /api/admin/library/books
#### Route
`POST /api/admin/library/books`
#### Purpose
Create an admin book record.
#### Auth
Bearer token required.
#### Allowed Roles
Admin.
#### Required Permission
Admin middleware.
#### Content-Type
application/json or multipart/form-data
#### Path Params
None.
#### Query Params
None.
#### Request Body
| Field | Type | Required | Notes |
|---|---|---|---|
| title | string | Yes | Max 255 |
| description | string | Yes | |
| source_type | string | Yes | file, link, embed |
| file_path | file | Conditional | Required for file; pdf/doc/docx/epub; max 50MB |
| source_link | string | Conditional | Required for link or embed |
| cover_type | string | Yes | auto or upload |
| cover_path | file | Conditional | Required for upload; jpg/jpeg/png/webp/avif; max 10MB |
| keywords | array | No | |
| author_name | string | Yes | Max 255 |
| type | string | Yes | single or part |
| book_series_id | integer | Conditional | Required for part; existing series |
| section_id | integer | No | books module or legacy null module |
#### Example Request
`multipart/form-data: title=Book, description=Description, source_type=file, file_path=@book.pdf, cover_type=auto, author_name=Author, type=single`
#### Success Response
```json
{"message":"Book created successfully","data":{"id":1,"title":"Book","source_type":"file","type":"single"}}
```
#### Error Responses
```json
{"message":"Unauthenticated."}
```
```json
{"message":"The given data was invalid.","errors":{"file_path":["The file field is required."]}}
```
#### Frontend Notes
The backend stores uploaded files under public book storage.

### GET /api/admin/library/books/{book}
#### Route
`GET /api/admin/library/books/{book}`
#### Purpose
Return one admin book.
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
| book | integer | Yes | Book route-model binding ID |
#### Query Params
None.
#### Request Body
No request body.
#### Example Request
`GET /api/admin/library/books/1` with `Authorization: Bearer {token}`
#### Success Response
```json
{"id":1,"title":"Book","type":"single"}
```
#### Error Responses
```json
{"message":"Book not found"}
```
#### Frontend Notes
Admin resource responses return the model directly for show.

### PUT /api/admin/library/books/{book}
#### Route
`PUT /api/admin/library/books/{book}`
#### Purpose
Update an admin book.
#### Auth
Bearer token required.
#### Allowed Roles
Admin.
#### Required Permission
Admin middleware.
#### Content-Type
application/json or multipart/form-data
#### Path Params
| Name | Type | Required | Notes |
|---|---|---|---|
| book | integer | Yes | Book route-model binding ID |
#### Query Params
None.
#### Request Body
| Field | Type | Required | Notes |
|---|---|---|---|
| title | string | No | Max 255 |
| description | string | No | |
| source_type | string | No | file, link, embed |
| file_path | file | No | pdf/doc/docx/epub; max 50MB |
| source_link | string | No | Link/embed source |
| cover_type | string | No | auto or upload |
| cover_path | file | No | jpg/jpeg/png/webp/avif; max 10MB |
| keywords | array | No | |
| author_name | string | No | Max 255 |
| type | string | No | single or part |
| book_series_id | integer | No | Existing series |
| section_id | integer | No | books or legacy null module |
#### Example Request
`{"title":"Updated Book"}`
#### Success Response
```json
{"message":"Book updated successfully","data":{"id":1,"title":"Updated Book"}}
```
#### Error Responses
```json
{"message":"Book not found"}
```
```json
{"message":"The given data was invalid.","errors":{"source_type":["The selected source type is invalid."]}}
```
#### Frontend Notes
Upload fields are optional during update.

### PATCH /api/admin/library/books/{book}
#### Route
`PATCH /api/admin/library/books/{book}`
#### Purpose
Partially update an admin book.
#### Auth
Bearer token required.
#### Allowed Roles
Admin.
#### Required Permission
Admin middleware.
#### Content-Type
application/json or multipart/form-data
#### Path Params
| Name | Type | Required | Notes |
|---|---|---|---|
| book | integer | Yes | Book route-model binding ID |
#### Query Params
None.
#### Request Body
| Field | Type | Required | Notes |
|---|---|---|---|
| title | string | No | Max 255 |
| description | string | No | |
| source_type | string | No | file, link, embed |
| file_path | file | No | pdf/doc/docx/epub; max 50MB |
| source_link | string | No | Link/embed source |
| cover_type | string | No | auto or upload |
| cover_path | file | No | jpg/jpeg/png/webp/avif; max 10MB |
| keywords | array | No | |
| author_name | string | No | |
| type | string | No | single or part |
| book_series_id | integer | No | Existing series |
| section_id | integer | No | books or legacy null module |
#### Example Request
`{"keywords":["history","library"]}`
#### Success Response
```json
{"message":"Book updated successfully","data":{"id":1,"keywords":["history","library"]}}
```
#### Error Responses
```json
{"message":"Book not found"}
```
```json
{"message":"The given data was invalid.","errors":{"cover_path":["The cover path must be an image."]}}
```
#### Frontend Notes
PATCH uses the same controller validation as the update route.

### DELETE /api/admin/library/books/{book}
#### Route
`DELETE /api/admin/library/books/{book}`
#### Purpose
Delete an admin book.
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
| book | integer | Yes | Book route-model binding ID |
#### Query Params
None.
#### Request Body
No request body.
#### Example Request
`DELETE /api/admin/library/books/1` with `Authorization: Bearer {token}`
#### Success Response
```json
{"message":"Book deleted successfully"}
```
#### Error Responses
```json
{"message":"Book not found"}
```
#### Frontend Notes
Deletion is physical through the current controller.

### GET /api/admin/library/series
#### Route
`GET /api/admin/library/series`
#### Purpose
List all book series for admin use.
#### Auth
Bearer token required.
#### Allowed Roles
Admin.
#### Required Permission
Admin middleware.
#### Content-Type
None.
#### Path Params
None.
#### Query Params
None.
#### Request Body
No request body.
#### Example Request
`GET /api/admin/library/series` with `Authorization: Bearer {token}`
#### Success Response
```json
[{"id":1,"name":"Series","description":"Description"}]
```
#### Error Responses
```json
{"message":"Unauthorized. Admin access required."}
```
#### Frontend Notes
The controller returns a direct array, not a paginator.

### POST /api/admin/library/series
#### Route
`POST /api/admin/library/series`
#### Purpose
Create a book series.
#### Auth
Bearer token required.
#### Allowed Roles
Admin.
#### Required Permission
Admin middleware.
#### Content-Type
application/json
#### Path Params
None.
#### Query Params
None.
#### Request Body
| Field | Type | Required | Notes |
|---|---|---|---|
| name | string | Yes | Max 1,048,576 |
| description | string | No | |
#### Example Request
`{"name":"Series","description":"Description"}`
#### Success Response
```json
{"message":"Series created successfully","data":{"id":1,"name":"Series","description":"Description"}}
```
#### Error Responses
```json
{"message":"The given data was invalid.","errors":{"name":["The name field is required."]}}
```
#### Frontend Notes
Series endpoints are inside the authenticated admin route group.

### GET /api/admin/library/series/{series}
#### Route
`GET /api/admin/library/series/{series}`
#### Purpose
Return one book series.
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
| series | integer | Yes | Series route parameter ID |
#### Query Params
None.
#### Request Body
No request body.
#### Example Request
`GET /api/admin/library/series/1` with `Authorization: Bearer {token}`
#### Success Response
```json
{"id":1,"name":"Series","description":"Description"}
```
#### Error Responses
```json
{"message":"Series not found"}
```
#### Frontend Notes
The controller returns the series model directly.

### PUT /api/admin/library/series/{series}
#### Route
`PUT /api/admin/library/series/{series}`
#### Purpose
Update one book series.
#### Auth
Bearer token required.
#### Allowed Roles
Admin.
#### Required Permission
Admin middleware.
#### Content-Type
application/json
#### Path Params
| Name | Type | Required | Notes |
|---|---|---|---|
| series | integer | Yes | Series route parameter ID |
#### Query Params
None.
#### Request Body
| Field | Type | Required | Notes |
|---|---|---|---|
| name | string | No | Max 1,048,576 |
| description | string | No | |
#### Example Request
`{"name":"Updated Series"}`
#### Success Response
```json
{"message":"Series updated successfully","data":{"id":1,"name":"Updated Series"}}
```
#### Error Responses
```json
{"message":"Series not found"}
```
```json
{"message":"The given data was invalid.","errors":{"name":["The name must be a string."]}}
```
#### Frontend Notes
Both fields are optional on update.

### PATCH /api/admin/library/series/{series}
#### Route
`PATCH /api/admin/library/series/{series}`
#### Purpose
Partially update one book series.
#### Auth
Bearer token required.
#### Allowed Roles
Admin.
#### Required Permission
Admin middleware.
#### Content-Type
application/json
#### Path Params
| Name | Type | Required | Notes |
|---|---|---|---|
| series | integer | Yes | Series route parameter ID |
#### Query Params
None.
#### Request Body
| Field | Type | Required | Notes |
|---|---|---|---|
| name | string | No | Max 1,048,576 |
| description | string | No | |
#### Example Request
`{"description":"Updated description"}`
#### Success Response
```json
{"message":"Series updated successfully","data":{"id":1,"description":"Updated description"}}
```
#### Error Responses
```json
{"message":"Series not found"}
```
#### Frontend Notes
PATCH uses the series controller update behavior.

### DELETE /api/admin/library/series/{series}
#### Route
`DELETE /api/admin/library/series/{series}`
#### Purpose
Delete one book series.
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
| series | integer | Yes | Series route parameter ID |
#### Query Params
None.
#### Request Body
No request body.
#### Example Request
`DELETE /api/admin/library/series/1` with `Authorization: Bearer {token}`
#### Success Response
```json
{"message":"Series deleted successfully"}
```
#### Error Responses
```json
{"message":"Series not found"}
```
#### Frontend Notes
The current controller deletes the series without a documented usage conflict response.

### GET /api/admin/library/books/authors
#### Route
`GET /api/admin/library/books/authors`
#### Purpose
Return distinct non-null book author names.
#### Auth
Bearer token required.
#### Allowed Roles
Admin.
#### Required Permission
Admin middleware.
#### Content-Type
None.
#### Path Params
None.
#### Query Params
None.
#### Request Body
No request body.
#### Example Request
`GET /api/admin/library/books/authors` with `Authorization: Bearer {token}`
#### Success Response
```json
["Author One","Author Two"]
```
#### Error Responses
```json
{"message":"Unauthorized. Admin access required."}
```
#### Frontend Notes
This endpoint is metadata for admin UI and is not a public book-list author filter.
