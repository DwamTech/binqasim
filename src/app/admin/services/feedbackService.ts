// ════════════════════════════════════════════════════════════════════════════
// FEEDBACK SERVICE - API Integration for Suggestions, Complaints & Ratings
// ════════════════════════════════════════════════════════════════════════════

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface FeedbackItem {
    id: number;
    name: string;
    email: string;
    phone_number: string | null;
    message: string;
    attachment_path: string | null;
    type: "suggestion" | "complaint";
    created_at: string;
    updated_at: string;
}

export interface PaginatedFeedback {
    current_page: number;
    data: FeedbackItem[];
    last_page: number;
    per_page: number;
    total: number;
}

export interface PlatformRating {
    average_rating: number;
    rating_count: number;
    max_rating: number;
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
// FEEDBACK SERVICE OBJECT
// ═══════════════════════════════════════════════════════════════════════════

export const FeedbackService = {
    /**
     * Get paginated feedback (suggestions or complaints)
     * GET /api/admin/feedback
     */
    getAll: async (params?: {
        type?: "suggestion" | "complaint";
        page?: number;
    }): Promise<PaginatedFeedback> => {
        const searchParams = new URLSearchParams();
        if (params?.type) searchParams.append("type", params.type);
        if (params?.page) searchParams.append("page", params.page.toString());

        const url = `${API_BASE_URL}/admin/feedback${searchParams.toString() ? `?${searchParams}` : ""}`;
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
     * Get suggestions only
     */
    getSuggestions: async (page: number = 1): Promise<PaginatedFeedback> => {
        return FeedbackService.getAll({ type: "suggestion", page });
    },

    /**
     * Get complaints only
     */
    getComplaints: async (page: number = 1): Promise<PaginatedFeedback> => {
        return FeedbackService.getAll({ type: "complaint", page });
    },

    /**
     * Delete a feedback item
     * DELETE /api/admin/feedback/{id}
     */
    delete: async (id: number): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/admin/feedback/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            await handleApiError(response);
        }
    },

    /**
     * Get platform rating statistics
     * GET /api/platform-rating
     */
    getPlatformRating: async (): Promise<PlatformRating> => {
        const response = await fetch(`${API_BASE_URL}/platform-rating`, {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        });

        if (!response.ok) {
            await handleApiError(response);
        }

        return response.json();
    },
};
