# Backend Requirements for Admin Dashboard (Home Page)

**To:** Backend Team
**From:** Frontend Team
**Date:** 2025-12-30
**Subject:** API Requirments for Admin Dashboard - Phase 1 (Home Page)

Hello,
To proceed with the development of the dynamic Admin Dashboard, we require the following API endpoints. Please review and let us know if there are any constraints.

## 1. General Summary (KPIs)
**Purpose:** Display top-level statistics on the dashboard cards.
- **Endpoint:** `GET /api/admin/dashboard/summary`
- **Authentication:** Admin Token Required
- **Expected Response (JSON):**
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

## 2. Analytics Chart Data
**Purpose:** Populate the "Visitors Analysis" or "Activity" chart (e.g., last 7 or 30 days).
- **Endpoint:** `GET /api/admin/dashboard/analytics?period=7d`
- **Parameters:** `period` (optional): `7d`, `30d`, `1y` (default `7d`)
- **Expected Response (JSON):**
```json
{
  "status": "success",
  "data": [
    { "date": "2025-12-24", "visits": 120, "requests": 5 },
    { "date": "2025-12-25", "visits": 150, "requests": 8 },
    { "date": "2025-12-26", "visits": 110, "requests": 2 },
    // ...
  ]
}
```

## 3. Recent Support Requests
**Purpose:** Display the "Recent Requests" list widget on the dashboard.
- **Endpoint:** `GET /api/admin/support-requests/recent`
- **Parameters:** `limit` (optional, default 5)
- **Expected Response (JSON):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 105,
      "type": "individual", // or "institution"
      "applicant_name": "Ahmed Mohamed",
      "status": "pending", // pending, approved, rejected
      "created_at": "2025-12-30T10:30:00Z",
      "avatar_url": "https://..." // optional
    },
    {
      "id": 104,
      "type": "institution",
      "applicant_name": "Al-Amal Charity",
      "status": "approved",
      "created_at": "2025-12-29T15:20:00Z"
    }
  ]
}
```

## 4. Notifications (Header)
**Purpose:** Show unread notifications count in the header bell icon.
- **Endpoint:** `GET /api/admin/notifications/unread-count`
- **Expected Response (JSON):**
```json
{
  "status": "success",
  "data": {
    "count": 3
  }
}
```

---
**Notes:**
*   All dates should be in **UTC ISO 8601** format.
*   Please ensure standard HTTP status codes (200 for success, 401 for unauthorized, etc.).
