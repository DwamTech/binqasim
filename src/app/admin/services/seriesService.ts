// Book Series Service
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface Series {
    id: number;
    name: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
}

export const SeriesService = {
    // Get all series
    getAll: async (): Promise<Series[]> => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/admin/library/series`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            }
        });

        if (!res.ok) throw new Error("فشل جلب السلاسل");
        const data = await res.json();
        return Array.isArray(data) ? data : (data.data || []);
    },

    // Create new series
    create: async (data: { name: string; description?: string }): Promise<any> => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/admin/library/series`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error("فشل إضافة السلسلة");
        return res.json();
    },

    // Update series
    update: async (id: number, data: { name: string; description?: string }): Promise<Series> => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/admin/library/series/${id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error("فشل تحديث السلسلة");
        return res.json();
    },

    // Delete series
    delete: async (id: number): Promise<void> => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/admin/library/series/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            }
        });

        if (!res.ok) throw new Error("فشل حذف السلسلة");
    }
};
