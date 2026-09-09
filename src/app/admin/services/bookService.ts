// Book Service
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface Book {
    id: number;
    title: string;
    description: string;
    author_name: string;
    source_type: 'file' | 'link' | 'embed';
    file_path?: string;
    source_link?: string;
    cover_type: 'auto' | 'upload';
    cover_path?: string;
    type: 'single' | 'part';
    book_series_id?: number;
    keywords?: string[];
    created_at?: string;
    updated_at?: string;
    series?: {
        id: number;
        name: string;
    };
}

export const BookService = {
    // Get all books with pagination and search
    getAll: async (page: number = 1, search: string = "", limit: number = 15): Promise<any> => {
        const token = localStorage.getItem("token");
        let url = `${API_BASE_URL}/admin/library/books?page=${page}`;

        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (limit) url += `&per_page=${limit}`;

        const res = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            }
        });

        if (!res.ok) throw new Error("فشل جلب الكتب");
        return res.json();
    },

    // Get book by ID
    getById: async (id: number | string): Promise<Book> => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/admin/library/books/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            }
        });

        if (!res.ok) throw new Error("فشل جلب تفاصيل الكتاب");
        const json = await res.json();
        return json.book || json.data || json;
    },

    // Get authors for autocomplete
    getAuthors: async (): Promise<string[]> => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/admin/library/books/authors`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            }
        });

        if (!res.ok) throw new Error("فشل جلب المؤلفين");
        const data = await res.json();
        return Array.isArray(data) ? data : (data.data || []);
    },

    // Create new book
    create: async (formData: FormData): Promise<Book> => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/admin/library/books`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            },
            body: formData
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "فشل إضافة الكتاب");
        }
        return res.json();
    },

    // Update book
    update: async (id: number, formData: FormData): Promise<Book> => {
        const token = localStorage.getItem("token");

        // Add _method for Laravel compatibility
        formData.append('_method', 'PUT');

        const res = await fetch(`${API_BASE_URL}/admin/library/books/${id}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            },
            body: formData
        });

        if (!res.ok) throw new Error("فشل تحديث الكتاب");
        return res.json();
    },

    // Delete book
    delete: async (id: number): Promise<void> => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/admin/library/books/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            }
        });

        if (!res.ok) throw new Error("فشل حذف الكتاب");
    }
};
