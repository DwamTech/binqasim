// ════════════════════════════════════════════════════════════════════════════
// SITE CONTACT SERVICE - API Integration for Company Information Management
// ════════════════════════════════════════════════════════════════════════════

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface SocialMedia {
    youtube: string;
    twitter: string;
    facebook: string;
    snapchat: string;
    instagram: string;
    tiktok: string;
}

export interface PhoneNumbers {
    support_phone: string;
    management_phone: string;
    backup_phone: string;
}

export interface BusinessDetails {
    address: string;
    commercial_register: string;
    email: string;
}

export interface SiteContactData {
    social: SocialMedia;
    phones: PhoneNumbers;
    business_details: BusinessDetails;
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
// SITE CONTACT SERVICE OBJECT
// ═══════════════════════════════════════════════════════════════════════════

export const SiteContactService = {
    /**
     * Get all site contact information
     * GET /api/admin/site-contact
     */
    getAll: async (): Promise<SiteContactData> => {
        const response = await fetch(`${API_BASE_URL}/admin/site-contact`, {
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
     * Update all site contact information
     * PUT /api/admin/site-contact
     */
    updateAll: async (data: SiteContactData): Promise<SiteContactData> => {
        const response = await fetch(`${API_BASE_URL}/admin/site-contact`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            await handleApiError(response);
        }

        return response.json();
    },

    /**
     * Update social media links only
     * PUT /api/admin/site-contact/social
     */
    updateSocial: async (social: SocialMedia): Promise<{ success: boolean; message: string }> => {
        const response = await fetch(`${API_BASE_URL}/admin/site-contact/social`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(social),
        });

        if (!response.ok) {
            await handleApiError(response);
        }

        return response.json();
    },

    /**
     * Update phone numbers only
     * PUT /api/admin/site-contact/phones
     */
    updatePhones: async (phones: PhoneNumbers): Promise<{ success: boolean; message: string }> => {
        const response = await fetch(`${API_BASE_URL}/admin/site-contact/phones`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(phones),
        });

        if (!response.ok) {
            await handleApiError(response);
        }

        return response.json();
    },

    /**
     * Update business details only
     * PUT /api/admin/site-contact/business
     */
    updateBusiness: async (business: BusinessDetails): Promise<{ success: boolean; message: string }> => {
        const response = await fetch(`${API_BASE_URL}/admin/site-contact/business`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(business),
        });

        if (!response.ok) {
            await handleApiError(response);
        }

        return response.json();
    },
};
