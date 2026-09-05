const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const ArticleService = {
    create: async (formData: FormData): Promise<any> => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/articles`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
                // Content-Type is set automatically for FormData
            },
            body: formData,
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "فشل إنشاء المقال");
        }

        return res.json();
    },

    getAuthors: async (): Promise<string[]> => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/admin/articles/authors`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            }
        });

        if (!res.ok) {
            // Non-critical, return empty if fails
            console.warn("Failed to fetch authors");
            return [];
        }

        const json = await res.json();
        return Array.isArray(json) ? json : (json.data || []);
    },

    getAll: async (page = 1, search = "", limit = 15, sectionId?: number | string): Promise<any> => {
        const token = localStorage.getItem("token");
        let url = `${API_BASE_URL}/articles?page=${page}&search=${search}&per_page=${limit}`;
        if (sectionId) url += `&section_id=${sectionId}`;

        const res = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            }
        });

        if (!res.ok) throw new Error("فشل جلب المقالات");
        return res.json();
    },

    delete: async (id: number): Promise<void> => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/articles/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            }
        });

        if (!res.ok) throw new Error("فشل حذف المقال");
    },

    getById: async (id: number | string): Promise<any> => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/articles/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            }
        });

        if (!res.ok) throw new Error("فشل جلب تفاصيل المقال");
        const json = await res.json();
        // Return article wrapper or direct data
        return json.article || json.data || json;
    },

    // Using a generic update for edits, status toggles usually just update the status field
    update: async (id: number, data: any): Promise<any> => {
        const token = localStorage.getItem("token");

        const headers: any = {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
        };

        let body = data;
        let method = "POST"; // Default to POST for FormData compatibility with Laravel

        if (!(data instanceof FormData)) {
            // For simple JSON updates (like status toggle)
            headers["Content-Type"] = "application/json";
            body = JSON.stringify(data);
            // Note: Keep POST if _method:PUT is in data, otherwise could use PUT
            // But for consistency with Laravel patterns, POST is safer
        }

        const res = await fetch(`${API_BASE_URL}/articles/${id}`, {
            method: method,
            headers: headers,
            body: body
        });

        if (!res.ok) throw new Error("فشل تحديث المقال");
        return res.json();
    },

    // Toggle article status (published <-> draft)
    toggleStatus: async (id: number): Promise<any> => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/articles/${id}/toggle-status`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            }
        });

        if (!res.ok) throw new Error("فشل تغيير حالة المقال");
        return res.json();
    }
};
