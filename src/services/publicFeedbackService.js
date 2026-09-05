// ════════════════════════════════════════════════════════════════════════════
// PUBLIC FEEDBACK SERVICE - Platform Rating, Suggestions & Complaints
// ════════════════════════════════════════════════════════════════════════════

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Handle API response and extract error messages
 * @param {Response} response
 * @returns {Promise<Object>}
 */
const handleApiResponse = async (response) => {
    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.message || "حدث خطأ غير متوقع");
        error.status = response.status;
        error.data = data;

        // Handle validation errors (422)
        if (response.status === 422 && data.errors) {
            error.validationErrors = data.errors;
        }

        // Handle rate limit (429)
        if (response.status === 429) {
            error.rateLimited = true;
        }

        throw error;
    }

    return data;
};

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC FEEDBACK SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export const PublicFeedbackService = {
    /**
     * Get current platform rating statistics
     * GET /api/platform-rating
     * @returns {Promise<{average_rating: number, rating_count: number, max_rating: number}>}
     */
    getRatingStats: async () => {
        const response = await fetch(`${API_BASE_URL}/platform-rating`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
            },
        });

        return handleApiResponse(response);
    },

    /**
     * Submit a platform rating (1-5 stars)
     * POST /api/platform-rating
     * @param {number} rating - Rating from 1 to 5
     * @returns {Promise<{average_rating: number, rating_count: number, max_rating: number}>}
     */
    submitRating: async (rating) => {
        const response = await fetch(`${API_BASE_URL}/platform-rating`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({ rating }),
        });

        return handleApiResponse(response);
    },

    /**
     * Submit a suggestion
     * POST /api/feedback (type: suggestion)
     * @param {Object} data - Suggestion data
     * @param {string} data.name - User name
     * @param {string} data.email - User email
     * @param {string} data.message - Suggestion message
     * @param {string} [data.phone_number] - Optional phone
     * @param {File} [data.attachment] - Optional file attachment
     * @returns {Promise<{message: string}>}
     */
    submitSuggestion: async (data) => {
        const formData = new FormData();
        formData.append("type", "suggestion");
        formData.append("name", data.name);
        formData.append("email", data.email);
        formData.append("message", data.message);

        if (data.phone_number) {
            formData.append("phone_number", data.phone_number);
        }

        if (data.attachment) {
            formData.append("attachment_path", data.attachment);
        }

        const response = await fetch(`${API_BASE_URL}/feedback`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
            },
            body: formData,
        });

        return handleApiResponse(response);
    },

    /**
     * Submit a complaint
     * POST /api/feedback (type: complaint)
     * @param {Object} data - Complaint data
     * @param {string} data.name - User name
     * @param {string} data.email - User email
     * @param {string} data.message - Complaint message
     * @param {string} [data.phone_number] - Optional phone
     * @param {File} [data.attachment] - Optional file attachment
     * @returns {Promise<{message: string}>}
     */
    submitComplaint: async (data) => {
        const formData = new FormData();
        formData.append("type", "complaint");
        formData.append("name", data.name);
        formData.append("email", data.email);
        formData.append("message", data.message);

        if (data.phone_number) {
            formData.append("phone_number", data.phone_number);
        }

        if (data.attachment) {
            formData.append("attachment_path", data.attachment);
        }

        const response = await fetch(`${API_BASE_URL}/feedback`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
            },
            body: formData,
        });

        return handleApiResponse(response);
    },
};

export default PublicFeedbackService;
