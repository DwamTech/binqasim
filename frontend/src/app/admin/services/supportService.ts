// Support Requests Service
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export type RequestStatus =
    | 'pending'
    | 'waiting_for_documents'
    | 'documents_review'
    | 'completed'
    | 'rejected'
    | 'archived';

export interface SupportRequest {
    id: number;
    request_number: string;
    full_name?: string;
    institution_name?: string;
    phone_number: string;
    email?: string;
    status: RequestStatus;
    created_at: string;
    updated_at: string;
    admin_response_message?: string;
    rejection_reason?: string;
    closure_receipt_path?: string;
    project_report_path?: string;
    support_letter_response_path?: string;
    // Additional fields based on your backend
    [key: string]: any;
}

export interface UpdateStatusRequest {
    status: RequestStatus;
    admin_response_message?: string;
    rejection_reason?: string;
}

export const SupportService = {
    // Individual Requests
    individual: {
        getAll: async (page: number = 1, status?: string, search?: string): Promise<any> => {
            const token = localStorage.getItem("token");
            let url = `${API_BASE_URL}/admin/support/individual/requests?page=${page}`;

            if (status) url += `&status=${status}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;

            const res = await fetch(url, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json",
                }
            });

            if (!res.ok) throw new Error("فشل جلب طلبات الأفراد");
            return res.json();
        },

        getById: async (id: number | string): Promise<SupportRequest> => {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/admin/support/individual/requests/${id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json",
                }
            });

            if (!res.ok) throw new Error("فشل جلب تفاصيل الطلب");
            const json = await res.json();
            return json.request || json.data || json;
        },

        updateStatus: async (id: number, data: UpdateStatusRequest): Promise<any> => {
            const token = localStorage.getItem("token");

            // Filter out undefined values - JSON.stringify removes them anyway
            // but we want to be explicit and send only defined values
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([_, v]) => v !== undefined)
            );

            const res = await fetch(`${API_BASE_URL}/admin/support/individual/requests/${id}/update`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify(cleanData)
            });

            if (!res.ok) throw new Error("فشل تحديث حالة الطلب");
            return res.json();
        }
    },

    // Institutional Requests
    institutional: {
        getAll: async (page: number = 1, status?: string, search?: string): Promise<any> => {
            const token = localStorage.getItem("token");
            let url = `${API_BASE_URL}/admin/support/institutional/requests?page=${page}`;

            if (status) url += `&status=${status}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;

            const res = await fetch(url, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json",
                }
            });

            if (!res.ok) throw new Error("فشل جلب طلبات المؤسسات");
            return res.json();
        },

        getById: async (id: number | string): Promise<SupportRequest> => {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/admin/support/institutional/requests/${id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json",
                }
            });

            if (!res.ok) throw new Error("فشل جلب تفاصيل الطلب");
            const json = await res.json();
            return json.request || json.data || json;
        },

        getAllForExport: async (startDate?: string, endDate?: string): Promise<any> => {
            const token = localStorage.getItem("token");
            let url = `${API_BASE_URL}/admin/support/institutional/requests?limit=1000`; // Fetch all suitable for export

            if (startDate) url += `&from_date=${startDate}`;
            if (endDate) url += `&to_date=${endDate}`;

            const res = await fetch(url, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json",
                }
            });
            if (!res.ok) throw new Error("فشل جلب بيانات التصدير");
            return res.json();
        },

        updateStatus: async (id: number, data: UpdateStatusRequest): Promise<any> => {
            const token = localStorage.getItem("token");

            // Filter out undefined values
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([_, v]) => v !== undefined)
            );

            const res = await fetch(`${API_BASE_URL}/admin/support/institutional/requests/${id}/update`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify(cleanData)
            });

            if (!res.ok) throw new Error("فشل تحديث حالة الطلب");
            return res.json();
        }
    }
};

// Helper function to get status label in Arabic
export const getStatusLabel = (status: RequestStatus): string => {
    const labels: Record<RequestStatus, string> = {
        'pending': 'تحت المراجعة',
        'waiting_for_documents': 'بانتظار المرفقات',
        'documents_review': 'مراجعة المرفقات',
        'completed': 'مكتمل',
        'rejected': 'مرفوض',
        'archived': 'مؤرشف'
    };
    return labels[status] || status;
};

// Helper function to get status color
export const getStatusColor = (status: RequestStatus): string => {
    const colors: Record<RequestStatus, string> = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'waiting_for_documents': 'bg-blue-100 text-blue-800',
        'documents_review': 'bg-purple-100 text-purple-800',
        'completed': 'bg-green-100 text-green-800',
        'rejected': 'bg-red-100 text-red-800',
        'archived': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
};
