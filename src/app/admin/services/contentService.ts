const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface SystemContentResponse {
    key: string;
    content: string;
}

export const ContentService = {
    get: async (key: string): Promise<string> => {
        // Public endpoint to get content
        const res = await fetch(`${API_BASE_URL}/system-content/${key}`, {
            headers: {
                "Accept": "application/json",
            },
            cache: 'no-store'
        });

        if (!res.ok) {
            if (res.status === 404) return ""; // Return empty if not created yet
            throw new Error("فشل تحميل المحتوى");
        }

        const json = await res.json();
        // Adjust based on actual response structure {data: {content: ...}} or just {content: ...}
        return json.data?.content || json.content || "";
    },

    update: async (key: string, content: string): Promise<any> => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/admin/system-content/${key}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({ content })
        });

        if (!res.ok) throw new Error("فشل حفظ المحتوى");
        return res.json();
    }
};
