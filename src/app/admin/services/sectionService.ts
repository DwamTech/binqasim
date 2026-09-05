const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface Section {
    id: number;
    name: string;
    slug: string;
    description?: string;
    is_active: boolean;
}

export const SectionService = {
    getAll: async (): Promise<Section[]> => {
        const res = await fetch(`${API_BASE_URL}/sections`, {
            headers: {
                "Accept": "application/json"
            }
        });
        if (!res.ok) throw new Error("فشل في جلب الأقسام");
        const json = await res.json();
        // Handle if response is wrapped in { data: [...] } or just [...]
        return Array.isArray(json) ? json : (json.data || []);
    },

    create: async (name: string, description?: string): Promise<Section> => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/sections`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ name, description })
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "فشل إنشاء القسم");
        }

        const json = await res.json();
        // Try to find the section object in likely properties
        if (json.data) return json.data;
        if (json.section) return json.section;
        if (json.id && json.name) return json;

        // Fallback: assume it might be in data or just return json and let the caller handle
        return json;
    }
};
