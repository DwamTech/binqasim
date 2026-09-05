// ════════════════════════════════════════════════════════════════════════════
// BACKUP SERVICE - API Integration for Backup Management
// ════════════════════════════════════════════════════════════════════════════

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface BackupFile {
    file_name: string;
    file_size: string;
    created_at: string;
    download_link: string;
}

export interface BackupHistoryItem {
    id: number;
    type: "create" | "restore" | "clean" | "monitor" | "upload" | "queued";
    status: "started" | "success" | "failed" | "queued";
    file_name: string | null;
    file_size: number | null;
    message: string | null;
    user_id: number | null;
    created_at: string;
    updated_at: string;
}

export interface CreateBackupResponse {
    success: boolean;
    mode: string;
    message: string;
}

export interface UploadBackupResponse {
    success: boolean;
    message: string;
    file_name: string;
}

export interface RestoreBackupResponse {
    success: boolean;
    message: string;
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
// BACKUP SERVICE OBJECT
// ═══════════════════════════════════════════════════════════════════════════

export const BackupService = {
    /**
     * Get list of all available backup files
     * GET /api/backups
     */
    getBackups: async (): Promise<BackupFile[]> => {
        const response = await fetch(`${API_BASE_URL}/backups`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            await handleApiError(response);
        }

        const data = await response.json();
        // API returns array directly
        return Array.isArray(data) ? data : data.data || [];
    },

    /**
     * Get backup operation history
     * GET /api/backups/history
     */
    getHistory: async (): Promise<BackupHistoryItem[]> => {
        const response = await fetch(`${API_BASE_URL}/backups/history`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            await handleApiError(response);
        }

        const data = await response.json();
        return Array.isArray(data) ? data : data.data || [];
    },

    /**
     * Create a new backup
     * POST /api/backups/create
     * @param mode - "full" for complete backup, "db" for database only
     */
    createBackup: async (mode: "full" | "db" = "full"): Promise<CreateBackupResponse> => {
        const response = await fetch(`${API_BASE_URL}/backups/create`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ mode }),
        });

        if (!response.ok) {
            await handleApiError(response);
        }

        return response.json();
    },

    /**
     * Download a specific backup file
     * GET /api/backups/download?file_name={fileName}
     */
    downloadBackup: async (fileName: string): Promise<void> => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

        const response = await fetch(
            `${API_BASE_URL}/backups/download?file_name=${encodeURIComponent(fileName)}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            await handleApiError(response);
        }

        // Create download link
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    },

    /**
     * Upload a backup file
     * POST /api/backups/upload
     */
    uploadBackup: async (file: File): Promise<UploadBackupResponse> => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_BASE_URL}/backups/upload`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
            body: formData,
        });

        if (!response.ok) {
            await handleApiError(response);
        }

        return response.json();
    },

    /**
     * Restore a backup
     * POST /api/backups/restore
     */
    restoreBackup: async (fileName: string): Promise<RestoreBackupResponse> => {
        const response = await fetch(`${API_BASE_URL}/backups/restore`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ file_name: fileName }),
        });

        if (!response.ok) {
            await handleApiError(response);
        }

        return response.json();
    },

    /**
     * Delete a backup file
     * Note: This endpoint may not exist yet based on documentation
     * DELETE /api/backups/delete
     */
    deleteBackup: async (fileName: string): Promise<{ success: boolean; message: string }> => {
        const response = await fetch(`${API_BASE_URL}/backups/delete`, {
            method: "DELETE",
            headers: getAuthHeaders(),
            body: JSON.stringify({ file_name: fileName }),
        });

        if (!response.ok) {
            // If endpoint doesn't exist, throw a more helpful error
            if (response.status === 404) {
                throw new Error("خاصية حذف النسخ الاحتياطية غير متاحة حالياً");
            }
            await handleApiError(response);
        }

        return response.json();
    },
};
