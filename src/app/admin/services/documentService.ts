const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface Document {
    id: number;
    title: string;
    description?: string;
    source_type: 'file' | 'link';
    file_path?: string;
    source_link?: string;
    cover_type: 'auto' | 'upload';
    cover_path?: string;
    keywords?: string[];
    file_type?: string;
    file_size?: number;
    views_count: number;
    downloads_count: number;
    user_id?: number;
    user?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at?: string;
}

export const DocumentService = {
    // Get all documents with optional filters
    getAll: async (page: number = 1, search: string = "", perPage: number = 20, fileType?: string): Promise<any> => {
        const params = new URLSearchParams({
            page: page.toString(),
            per_page: perPage.toString(),
        });

        if (search) params.append("search", search);
        if (fileType) params.append("file_type", fileType);

        const res = await fetch(`${API_BASE_URL}/documents?${params.toString()}`, {
            headers: {
                "Accept": "application/json",
            },
            cache: 'no-store'
        });

        if (!res.ok) throw new Error("فشل جلب الملفات");
        return res.json();
    },

    // Get document by ID
    getById: async (id: string | number): Promise<Document> => {
        const res = await fetch(`${API_BASE_URL}/documents/${id}`, {
            headers: {
                "Accept": "application/json",
            },
            cache: 'no-store'
        });

        if (!res.ok) throw new Error("فشل جلب تفاصيل الملف");
        const json = await res.json();
        return json.data || json;
    },

    // Register download
    registerDownload: async (id: number): Promise<{ download_url: string }> => {
        const res = await fetch(`${API_BASE_URL}/documents/${id}/download`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
            }
        });

        if (!res.ok) throw new Error("فشل تسجيل التحميل");
        return res.json();
    },

    // Admin: Create new document
    create: async (data: FormData): Promise<any> => {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE_URL}/admin/documents`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            },
            body: data
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({ message: "فشل إضافة الملف" }));
            throw new Error(error.message || "فشل إضافة الملف");
        }
        return res.json();
    },

    // Admin: Update document
    update: async (id: number, data: FormData): Promise<any> => {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE_URL}/admin/documents/${id}`, {
            method: "POST", // Using POST with _method=PUT for FormData compatibility
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            },
            body: data
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({ message: "فشل تحديث الملف" }));
            throw new Error(error.message || "فشل تحديث الملف");
        }
        return res.json();
    },

    // Admin: Delete document
    delete: async (id: number): Promise<any> => {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE_URL}/admin/documents/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            }
        });

        if (!res.ok) throw new Error("فشل حذف الملف");
        return res.json();
    },

    // Helper: Format file size
    formatFileSize: (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    },

    // Helper: Get file icon based on type
    getFileIcon: (fileType: string): string => {
        const icons: { [key: string]: string } = {
            'pdf': '📄',
            'doc': '📝',
            'docx': '📝',
            'xls': '📊',
            'xlsx': '📊',
            'ppt': '📊',
            'pptx': '📊',
            'txt': '📃',
            'zip': '🗜️',
            'rar': '🗜️',
        };
        return icons[fileType.toLowerCase()] || '📁';
    }
};
