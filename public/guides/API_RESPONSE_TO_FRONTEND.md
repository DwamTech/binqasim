# Admin API Documentation (Response to Frontend Requirements)

This document provides a complete reference for the API endpoints implemented for the Admin Dashboard and Management modules.

**Base URL:** `/api`
**Authentication:** Bearer Token (Sanctum) is required for all endpoints starting with `/admin`.

---

## 1. Dashboard & Analytics

### 1.1 Summary KPIs
- **Endpoint:** `GET /api/admin/dashboard/summary`
- **Description:** Returns top-level stats and trends.
- **Success Response:**
```json
{
  "status": "success",
  "data": {
    "total_articles": 1245,
    "total_users": 854,
    "daily_visits": 3422,
    "pending_support_requests": 12,
    "total_books": 320,
    "trends": {
        "articles": "+2.5%",
        "users": "+1.2%",
        "visits": "-0.5%"
    }
  }
}
```

### 1.2 Analytics Chart Data
- **Endpoint:** `GET /api/admin/dashboard/analytics`
- **Parameters:** `period` (optional): `7d`, `30d`, `1y` (default `7d`)
- **Description:** Data for visits and requests chart.
- **Success Response:**
```json
{
  "status": "success",
  "data": [
    { "date": "2025-12-24", "visits": 120, "requests": 5 },
    { "date": "2025-12-25", "visits": 150, "requests": 8 }
  ]
}
```

### 1.3 Recent Support Requests Widget
- **Endpoint:** `GET /api/admin/support-requests/recent`
- **Parameters:** `limit` (optional, default 5)
- **Description:** Returns a combined list of latest individual and institutional requests.
- **Success Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 105,
      "type": "individual",
      "applicant_name": "Ahmed Mohamed",
      "status": "pending",
      "created_at": "2025-12-30T10:30:00.000000Z"
    }
  ]
}
```

### 1.4 Unread Notifications Count
- **Endpoint:** `GET /api/admin/notifications/unread-count`
- **Success Response:**
```json
{
  "status": "success",
  "data": { "count": 3 }
}
```

---

## 2. Support Requests Management

### 2.1 Individual Support
- **List All:** `GET /api/admin/support/individual/requests`
- **Show Specific:** `GET /api/admin/support/individual/requests/{id}`
- **Update Status:** `POST /api/admin/support/individual/requests/{id}/update`
    - **Body (Form Data/JSON):**
        - `status`: `approved`, `rejected`, `pending`
        - `rejection_reason`: (string, required if status is rejected)
- **Delete:** `DELETE /api/admin/support/individual/requests/{id}`

### 2.2 Institutional Support
- **List All:** `GET /api/admin/support/institutional/requests`
- **Show Specific:** `GET /api/admin/support/institutional/requests/{id}`
- **Update Status:** `POST /api/admin/support/institutional/requests/{id}/update`
    - **Body (Form Data/JSON):**
        - `status`: same as above
        - `rejection_reason`: same as above
- **Delete:** `DELETE /api/admin/support/institutional/requests/{id}`

### 2.3 Support Settings
- **Update Settings:** `POST /api/admin/support/settings/update`
    - **Body:**
        - `individual_support_enabled`: `true`/`false`
        - `institutional_support_enabled`: `true`/`false`

---

## 3. Library Management

### 3.1 Book Series
- **List:** `GET /api/admin/library/series`
- **Create:** `POST /api/admin/library/series` (Params: `title_ar`, `title_en`, `description_ar`, `description_en`, `image`)
- **Show:** `GET /api/admin/library/series/{id}`
- **Update:** `PUT /api/admin/library/series/{id}`
- **Delete:** `DELETE /api/admin/library/series/{id}`

### 3.2 Books
- **List:** `GET /api/admin/library/books`
- **Create:** `POST /api/admin/library/books` (Params: `series_id`, `title_ar`, `title_en`, `author`, `pdf_file`, etc.)
- **Show:** `GET /api/admin/library/books/{id}`
- **Update:** `PUT /api/admin/library/books/{id}`
- **Delete:** `DELETE /api/admin/library/books/{id}`

---

## 4. Feedback Management
- **List Feedback:** `GET /api/admin/feedback`
- **Delete Feedback:** `DELETE /api/admin/feedback/{id}`

---

## Technical Notes:
- **Analytic Tracking:** We implemented a `TrackVisits` middleware. Any **GET** request to public endpoints (or API routes) automatically increments the daily visit counter. No frontend effort required here other than consumption of chart data.
- **Date Formats:** Responses use ISO 8601 strings.
- **Error Handling:** Standard 4xx/5xx status codes are used with `{"message": "..."}` in the body.
