// ════════════════════════════════════════════════════════════════════════════
// NOTIFICATION SERVICE - API Integration for Admin Notifications
// ════════════════════════════════════════════════════════════════════════════

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    category: string;
    priority: "high" | "medium" | "low";
    is_read: boolean;
    data?: Record<string, any>;
    created_at: string;
    read_at?: string;
}

export interface NotificationCount {
    total: number;
    unread: number;
    read: number;
    high_priority_unread: number;
    by_category: Record<string, { total: number; unread: number }>;
    by_priority: Record<string, { total: number; unread: number }>;
}

export interface NotificationMeta {
    categories: string[];
    priorities: string[];
}

export interface PaginatedNotifications {
    data: Notification[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

const getAuthHeaders = (): HeadersInit => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
    };
};

const handleApiError = async (response: Response): Promise<never> => {
    let errorMessage = "حدث خطأ غير متوقع";
    try {
        const data = await response.json();
        errorMessage = data.message || data.error || errorMessage;
    } catch {
        errorMessage = `خطأ ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
};

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION SERVICE OBJECT
// ═══════════════════════════════════════════════════════════════════════════

export const NotificationService = {
    /**
     * Get paginated list of notifications
     * GET /api/admin/notifications
     */
    getAll: async (params?: {
        page?: number;
        per_page?: number;
        category?: string;
        priority?: string;
        is_read?: boolean;
    }): Promise<PaginatedNotifications> => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append("page", params.page.toString());
        if (params?.per_page) searchParams.append("per_page", params.per_page.toString());
        if (params?.category) searchParams.append("category", params.category);
        if (params?.priority) searchParams.append("priority", params.priority);
        if (params?.is_read !== undefined) searchParams.append("is_read", params.is_read.toString());

        const url = `${API_BASE_URL}/admin/notifications${searchParams.toString() ? `?${searchParams}` : ""}`;
        const response = await fetch(url, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            await handleApiError(response);
        }

        return response.json();
    },

    /**
     * Get notification counts and statistics
     * GET /api/admin/notifications/count
     */
    getCount: async (): Promise<NotificationCount> => {
        const response = await fetch(`${API_BASE_URL}/admin/notifications/count`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            await handleApiError(response);
        }

        const data = await response.json();
        return data.data || data;
    },

    /**
     * Get latest unread notifications
     * GET /api/admin/notifications/latest
     */
    getLatest: async (limit: number = 5): Promise<Notification[]> => {
        const response = await fetch(`${API_BASE_URL}/admin/notifications/latest?limit=${limit}`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            await handleApiError(response);
        }

        const json = await response.json();

        // Handle different response formats
        // Could be: { data: [...] } or { notifications: [...] } or [...] directly
        const data = json.data || json.notifications || json;

        // Ensure we always return an array
        if (Array.isArray(data)) {
            return data;
        }

        // If data is an object with nested data (paginated response)
        if (data && typeof data === 'object' && Array.isArray(data.data)) {
            return data.data;
        }

        // Fallback to empty array
        console.warn('Unexpected notification response format:', json);
        return [];
    },

    /**
     * Get available categories and priorities
     * GET /api/admin/notifications/meta
     */
    getMeta: async (): Promise<NotificationMeta> => {
        const response = await fetch(`${API_BASE_URL}/admin/notifications/meta`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            await handleApiError(response);
        }

        const data = await response.json();
        return data.data || data;
    },

    /**
     * Get single notification
     * GET /api/admin/notifications/{id}
     */
    getById: async (id: number): Promise<Notification> => {
        const response = await fetch(`${API_BASE_URL}/admin/notifications/${id}`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            await handleApiError(response);
        }

        const data = await response.json();
        return data.data || data;
    },

    /**
     * Mark notification as read
     * POST /api/admin/notifications/{id}/read
     */
    markAsRead: async (id: number): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/admin/notifications/${id}/read`, {
            method: "POST",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            await handleApiError(response);
        }
    },

    /**
     * Mark notification as unread
     * POST /api/admin/notifications/{id}/unread
     */
    markAsUnread: async (id: number): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/admin/notifications/${id}/unread`, {
            method: "POST",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            await handleApiError(response);
        }
    },

    /**
     * Mark all notifications as read
     * POST /api/admin/notifications/read-all
     */
    markAllAsRead: async (): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/admin/notifications/read-all`, {
            method: "POST",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            await handleApiError(response);
        }
    },

    /**
     * Delete a notification
     * DELETE /api/admin/notifications/{id}
     */
    delete: async (id: number): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/admin/notifications/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            await handleApiError(response);
        }
    },

    /**
     * Delete all read notifications
     * DELETE /api/admin/notifications/clear-read
     */
    clearRead: async (): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/admin/notifications/clear-read`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            await handleApiError(response);
        }
    },

    /**
     * Delete all notifications
     * DELETE /api/admin/notifications/clear-all
     */
    clearAll: async (): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/admin/notifications/clear-all`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            await handleApiError(response);
        }
    },
};
