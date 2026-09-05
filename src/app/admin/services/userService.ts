const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export type UserRole = 'admin' | 'editor' | 'author' | 'reviewer' | 'user';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    created_at: string;
    updated_at?: string;
}

export interface ProfileUpdateData {
    name?: string;
    email?: string;
    current_password?: string;
    new_password?: string;
    new_password_confirmation?: string;
}

export interface CreateUserData {
    name: string;
    email: string;
    password: string;
    role: UserRole;
}

export interface UpdateUserData {
    name?: string;
    email?: string;
    role?: UserRole;
}

export interface ChangePasswordData {
    new_password: string;
    new_password_confirmation: string;
}

export const UserService = {
    // ============ Profile Management (All Users) ============

    // Get current user profile
    getProfile: async (): Promise<User> => {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE_URL}/profile`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            },
            cache: 'no-store'
        });

        if (!res.ok) throw new Error("فشل جلب الملف الشخصي");
        return res.json();
    },

    // Update current user profile
    updateProfile: async (data: ProfileUpdateData): Promise<any> => {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE_URL}/profile`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({ message: "فشل تحديث الملف الشخصي" }));
            throw new Error(error.message || "فشل تحديث الملف الشخصي");
        }
        return res.json();
    },

    // ============ User Management (Admin Only) ============

    // Get all users with optional filters
    getAllUsers: async (page: number = 1, role?: UserRole, search?: string): Promise<any> => {
        const token = localStorage.getItem("token");

        const params = new URLSearchParams({
            page: page.toString(),
        });

        if (role) params.append("role", role);
        if (search) params.append("search", search);

        const res = await fetch(`${API_BASE_URL}/admin/users?${params.toString()}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            },
            cache: 'no-store'
        });

        if (!res.ok) throw new Error("فشل جلب قائمة المستخدمين");
        return res.json();
    },

    // Get user by ID
    getUserById: async (id: number): Promise<User> => {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            },
            cache: 'no-store'
        });

        if (!res.ok) throw new Error("فشل جلب تفاصيل المستخدم");
        return res.json();
    },

    // Create new user
    createUser: async (data: CreateUserData): Promise<any> => {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE_URL}/admin/users`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({ message: "فشل إنشاء الحساب" }));
            throw new Error(error.message || "فشل إنشاء الحساب");
        }
        return res.json();
    },

    // Update user
    updateUser: async (id: number, data: UpdateUserData): Promise<any> => {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({ message: "فشل تحديث المستخدم" }));
            throw new Error(error.message || "فشل تحديث المستخدم");
        }
        return res.json();
    },

    // Change user password (Admin)
    changeUserPassword: async (id: number, data: ChangePasswordData): Promise<any> => {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE_URL}/admin/users/${id}/change-password`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({ message: "فشل تغيير كلمة المرور" }));
            throw new Error(error.message || "فشل تغيير كلمة المرور");
        }
        return res.json();
    },

    // Delete user
    deleteUser: async (id: number): Promise<any> => {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            }
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({ message: "فشل حذف المستخدم" }));
            throw new Error(error.message || "فشل حذف المستخدم");
        }
        return res.json();
    },

    // Helper: Get role label in Arabic
    getRoleLabel: (role: UserRole): string => {
        const labels: Record<UserRole, string> = {
            'admin': 'مدير النظام',
            'editor': 'محرر',
            'author': 'كاتب',
            'reviewer': 'مراجع',
            'user': 'مستخدم',
        };
        return labels[role] || role;
    },

    // Helper: Get role color
    getRoleColor: (role: UserRole): string => {
        const colors: Record<UserRole, string> = {
            'admin': 'bg-red-100 text-red-700 border-red-200',
            'editor': 'bg-blue-100 text-blue-700 border-blue-200',
            'author': 'bg-green-100 text-green-700 border-green-200',
            'reviewer': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'user': 'bg-gray-100 text-gray-700 border-gray-200',
        };
        return colors[role] || colors.user;
    },
};
