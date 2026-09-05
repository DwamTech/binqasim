import { DashboardSummary, AnalyticsDataPoint, SupportRequest, ApiResponse } from "../models/dashboard";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const DashboardService = {
    getSummary: async (): Promise<DashboardSummary> => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/admin/dashboard/summary`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });
        if (!res.ok) throw new Error("Failed to fetch summary");
        const json = await res.json();
        return json.data;
    },

    getAnalytics: async (period = "7d"): Promise<AnalyticsDataPoint[]> => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/admin/dashboard/analytics?period=${period}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });
        if (!res.ok) throw new Error("Failed to fetch analytics");
        const json = await res.json();
        return json.data;
    },

    getRecentRequests: async (): Promise<SupportRequest[]> => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/admin/support/pending`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });
        if (!res.ok) throw new Error("Failed to fetch recent requests");
        const json = await res.json();

        // The API returns { individual_requests: [], institutional_requests: [], count: n }
        // We need to map them to SupportRequest[]

        const individuals = (json.individual_requests || []).map((item: any) => ({
            id: item.id,
            type: 'individual' as const,
            applicant_name: item.full_name,
            status: item.status || 'pending',
            created_at: item.created_at || new Date().toISOString(),
            avatar_url: item.avatar_url
        }));

        const institutions = (json.institutional_requests || []).map((item: any) => ({
            id: item.id,
            type: 'institution' as const,
            applicant_name: item.institution_name,
            status: item.status || 'pending',
            created_at: item.created_at || new Date().toISOString(),
            avatar_url: item.logo_url
        }));

        // Combine and sort by date descending
        const allRequests = [...individuals, ...institutions].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        return allRequests;
    },

    updateAllSupportSettings: async (value: boolean): Promise<any> => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/admin/support/settings/update-all`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            },
            body: JSON.stringify({ value: String(value) }),
        });
        if (!res.ok) {
            throw new Error("Failed to update settings");
        }
        return res.json();
    },

    getSupportSettings: async (): Promise<{ individual_support_enabled: boolean; institutional_support_enabled: boolean }> => {
        const token = localStorage.getItem("token");
        // Using the same endpoint with GET method as confirmed by the user
        const res = await fetch(`${API_BASE_URL}/admin/support/settings/update-all`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });
        if (!res.ok) throw new Error("Failed to fetch settings status");
        const json = await res.json();
        // The API returns the object directly or in a data wrapper. 
        // User example: { "individual_support_enabled": true, ... }
        // We return it as is or handle 'data'. Safer to return json directly if it matches user spec.
        return json;
    },

    getPendingRequestsValues: async (): Promise<{
        individual: {
            pending: number;
            review: number;
            total_action_needed: number;
        };
        institutional: {
            pending: number;
            review: number;
            total_action_needed: number;
        };
        total_pending: number;
        total_review: number;
    }> => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/admin/dashboard/pending-requests-values`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });
        if (!res.ok) throw new Error("Failed to fetch pending requests values");
        const json = await res.json();
        return json.data;
    },

    getSupportStats: async (): Promise<{
        institutional: {
            total: number;
            under_review: number;
            accepted: number;
            rejected: number;
        };
        individual: {
            total: number;
            under_review: number;
            accepted: number;
            rejected: number;
        };
    }> => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/admin/dashboard/support-stats`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });
        if (!res.ok) throw new Error("Failed to fetch support stats");
        const json = await res.json();
        return json.data;
    },
};
