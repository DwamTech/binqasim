"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
    FiDatabase,
    FiDownload,
    FiUpload,
    FiRefreshCw,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiHardDrive,
    FiCalendar,
    FiFileText,
    FiAlertTriangle,
    FiServer,
    FiShield,
    FiActivity,
    FiTrash2,
    FiPlay,
    FiArchive,
    FiAward
} from "react-icons/fi";
import { BackupService, BackupFile, BackupHistoryItem } from "./backupService";

// ════════════════════════════════════════════════════════════════════════════
// STAT CARD COMPONENT
// ════════════════════════════════════════════════════════════════════════════
const StatCard = ({
    title,
    value,
    icon,
    color,
    subtitle,
    pulse
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
    pulse?: boolean;
}) => (
    <div className="stat-card group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        {/* Gradient overlay */}
        <div className={`absolute inset-0 opacity-5 ${color}`}></div>

        {/* Floating decoration */}
        <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full ${color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}></div>

        <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
                <div className={`rounded-xl p-3 ${color} bg-opacity-15 transition-transform group-hover:scale-110`}>
                    {React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
                        className: `text-2xl ${color.replace("bg-", "text-")}`,
                    })}
                </div>
                {pulse && (
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                )}
            </div>
            <h4 className="text-gray-500 text-sm font-medium mb-1">{title}</h4>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            {subtitle && (
                <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
            )}
        </div>
    </div>
);

// ════════════════════════════════════════════════════════════════════════════
// STATUS BADGE COMPONENT
// ════════════════════════════════════════════════════════════════════════════
const StatusBadge = ({ status }: { status: string }) => {
    const config: { [key: string]: { bg: string; text: string; icon: React.ReactNode } } = {
        success: { bg: "bg-green-100", text: "text-green-700", icon: <FiCheckCircle /> },
        failed: { bg: "bg-red-100", text: "text-red-700", icon: <FiXCircle /> },
        started: { bg: "bg-yellow-100", text: "text-yellow-700", icon: <FiActivity /> },
        queued: { bg: "bg-blue-100", text: "text-blue-700", icon: <FiClock /> },
    };
    const { bg, text, icon } = config[status] || config.queued;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${bg} ${text}`}>
            {icon}
            {status === "success" ? "نجح" : status === "failed" ? "فشل" : status === "started" ? "جاري" : "في الانتظار"}
        </span>
    );
};

// ════════════════════════════════════════════════════════════════════════════
// TYPE BADGE COMPONENT
// ════════════════════════════════════════════════════════════════════════════
const TypeBadge = ({ type }: { type: string }) => {
    const labels: { [key: string]: string } = {
        create: "إنشاء",
        restore: "استرجاع",
        clean: "تنظيف",
        monitor: "مراقبة",
        upload: "رفع",
        queued: "انتظار"
    };
    return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
            {labels[type] || type}
        </span>
    );
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN BACKUP PAGE COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function BackupPage() {
    const [backups, setBackups] = useState<BackupFile[]>([]);
    const [history, setHistory] = useState<BackupHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [selectedMode, setSelectedMode] = useState<"full" | "db">("full");
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    // ═══════════════════════════════════════════════════════════════════════
    // DATA FETCHING
    // ═══════════════════════════════════════════════════════════════════════
    const fetchData = useCallback(async () => {
        try {
            const [backupsData, historyData] = await Promise.all([
                BackupService.getBackups().catch(() => []),
                BackupService.getHistory().catch(() => [])
            ]);
            setBackups(backupsData);
            setHistory(historyData);
        } catch (error) {
            console.error("Failed to fetch backup data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ═══════════════════════════════════════════════════════════════════════
    // TOAST HANDLER
    // ═══════════════════════════════════════════════════════════════════════
    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // ═══════════════════════════════════════════════════════════════════════
    // CREATE BACKUP
    // ═══════════════════════════════════════════════════════════════════════
    const handleCreateBackup = async () => {
        setActionLoading("create");
        try {
            await BackupService.createBackup(selectedMode);
            showToast("تم إرسال طلب إنشاء النسخة الاحتياطية بنجاح", "success");
            fetchData();
        } catch (error: any) {
            showToast(error.message || "فشل في إنشاء النسخة الاحتياطية", "error");
        } finally {
            setActionLoading(null);
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // DOWNLOAD BACKUP
    // ═══════════════════════════════════════════════════════════════════════
    const handleDownload = async (fileName: string) => {
        setActionLoading(`download-${fileName}`);
        try {
            await BackupService.downloadBackup(fileName);
            showToast("جاري تحميل النسخة الاحتياطية", "success");
        } catch (error: any) {
            showToast(error.message || "فشل في تحميل النسخة", "error");
        } finally {
            setActionLoading(null);
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // RESTORE BACKUP
    // ═══════════════════════════════════════════════════════════════════════
    const handleRestore = async () => {
        if (!selectedBackup) return;
        setActionLoading("restore");
        try {
            await BackupService.restoreBackup(selectedBackup);
            showToast("تم استرجاع النسخة الاحتياطية بنجاح", "success");
            setShowRestoreModal(false);
            setSelectedBackup(null);
            fetchData();
        } catch (error: any) {
            showToast(error.message || "فشل في استرجاع النسخة", "error");
        } finally {
            setActionLoading(null);
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // DELETE BACKUP
    // ═══════════════════════════════════════════════════════════════════════
    const handleDelete = async () => {
        if (!deleteTarget) return;
        setActionLoading("delete");
        try {
            await BackupService.deleteBackup(deleteTarget);
            showToast("تم حذف النسخة الاحتياطية بنجاح", "success");
            setShowDeleteModal(false);
            setDeleteTarget(null);
            fetchData();
        } catch (error: any) {
            showToast(error.message || "فشل في حذف النسخة", "error");
        } finally {
            setActionLoading(null);
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // FILE UPLOAD (DRAG & DROP)
    // ═══════════════════════════════════════════════════════════════════════
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            await uploadFile(files[0]);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files[0]) {
            await uploadFile(files[0]);
        }
    };

    const uploadFile = async (file: File) => {
        if (!file.name.endsWith(".zip")) {
            showToast("يجب أن يكون الملف بصيغة ZIP", "error");
            return;
        }

        setActionLoading("upload");
        try {
            await BackupService.uploadBackup(file);
            showToast("تم رفع النسخة الاحتياطية بنجاح", "success");
            fetchData();
        } catch (error: any) {
            showToast(error.message || "فشل في رفع النسخة", "error");
        } finally {
            setActionLoading(null);
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // COMPUTED VALUES
    // ═══════════════════════════════════════════════════════════════════════
    const totalSize = backups.reduce((acc, b) => {
        const sizeStr = b.file_size || "0";
        const num = parseFloat(sizeStr.replace(/[^0-9.]/g, "")) || 0;
        if (sizeStr.includes("G")) return acc + num * 1024;
        if (sizeStr.includes("M")) return acc + num;
        if (sizeStr.includes("K")) return acc + num / 1024;
        return acc + num / (1024 * 1024);
    }, 0);

    const lastBackup = backups.length > 0 ? backups[0] : null;
    const successCount = history.filter(h => h.status === "success").length;
    const failedCount = history.filter(h => h.status === "failed").length;

    // ═══════════════════════════════════════════════════════════════════════
    // LOADING STATE
    // ═══════════════════════════════════════════════════════════════════════
    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="relative">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
                    <FiDatabase className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary text-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            {/* ═══════════════════════════════════════════════════════════════
                TOAST NOTIFICATION
            ═══════════════════════════════════════════════════════════════ */}
            {toast && (
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideDown ${toast.type === "success" ? "bg-green-500" : "bg-red-500"
                    } text-white`}>
                    {toast.type === "success" ? <FiCheckCircle size={20} /> : <FiXCircle size={20} />}
                    <span className="font-medium">{toast.message}</span>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                HERO SECTION
            ═══════════════════════════════════════════════════════════════ */}
            <section className="backup-hero relative overflow-hidden rounded-3xl p-8">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }}></div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: `
                        linear-gradient(rgba(22, 85, 42, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(22, 85, 42, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: "40px 40px"
                }}></div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm mb-4">
                            <FiShield className="text-primary" />
                            <span className="text-sm font-bold text-gray-700">مركز النسخ الاحتياطي</span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">
                            إدارة النسخ الاحتياطية
                        </h1>
                        <p className="text-gray-600 max-w-lg">
                            حماية شاملة لبياناتك مع نظام النسخ الاحتياطي المتقدم. إنشاء واسترجاع وإدارة النسخ بسهولة.
                        </p>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleCreateBackup}
                            disabled={actionLoading === "create"}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {actionLoading === "create" ? (
                                <FiRefreshCw className="animate-spin" />
                            ) : (
                                <FiDatabase />
                            )}
                            إنشاء نسخة جديدة
                        </button>
                        <button
                            onClick={fetchData}
                            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                        >
                            <FiRefreshCw />
                            تحديث
                        </button>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                STATS CARDS
            ═══════════════════════════════════════════════════════════════ */}
            <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="إجمالي النسخ"
                    value={backups.length}
                    icon={<FiArchive />}
                    color="bg-primary"
                    subtitle="نسخة احتياطية متاحة"
                />
                <StatCard
                    title="الحجم الكلي"
                    value={`${totalSize.toFixed(1)} MB`}
                    icon={<FiHardDrive />}
                    color="bg-secondary"
                    subtitle="مساحة التخزين المستخدمة"
                />
                <StatCard
                    title="آخر نسخة"
                    value={lastBackup ? new Date(lastBackup.created_at).toLocaleDateString("ar-SA") : "لا يوجد"}
                    icon={<FiCalendar />}
                    color="bg-primary"
                    subtitle={lastBackup?.file_size || ""}
                    pulse={!!lastBackup}
                />
                <StatCard
                    title="نسبة النجاح"
                    value={history.length > 0 ? `${Math.round((successCount / history.length) * 100)}%` : "0%"}
                    icon={<FiAward />}
                    color="bg-green-500"
                    subtitle={`${successCount} ناجح • ${failedCount} فاشل`}
                />
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                MAIN CONTENT GRID
            ═══════════════════════════════════════════════════════════════ */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* ═══════════════════════════════════════════════════════════
                    LEFT COLUMN - BACKUP LIST & ACTIONS
                ═══════════════════════════════════════════════════════════ */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Backup Mode Selector */}
                    <section className="bg-white rounded-2xl p-6 shadow-lg">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                            <FiServer className="text-primary" />
                            خيارات النسخ الاحتياطي
                        </h2>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => setSelectedMode("full")}
                                className={`relative p-5 rounded-xl border-2 transition-all ${selectedMode === "full"
                                    ? "border-primary bg-primary/5"
                                    : "border-gray-200 hover:border-primary/50"
                                    }`}
                            >
                                {selectedMode === "full" && (
                                    <span className="absolute top-3 left-3">
                                        <FiCheckCircle className="text-primary" />
                                    </span>
                                )}
                                <FiDatabase className="text-3xl text-primary mb-3" />
                                <h3 className="font-bold text-gray-800">نسخة كاملة</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    قاعدة البيانات + الملفات (storage)
                                </p>
                            </button>

                            <button
                                onClick={() => setSelectedMode("db")}
                                className={`relative p-5 rounded-xl border-2 transition-all ${selectedMode === "db"
                                    ? "border-primary bg-primary/5"
                                    : "border-gray-200 hover:border-primary/50"
                                    }`}
                            >
                                {selectedMode === "db" && (
                                    <span className="absolute top-3 left-3">
                                        <FiCheckCircle className="text-primary" />
                                    </span>
                                )}
                                <FiServer className="text-3xl text-secondary mb-3" />
                                <h3 className="font-bold text-gray-800">قاعدة البيانات فقط</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    نسخة سريعة للبيانات
                                </p>
                            </button>
                        </div>
                    </section>

                    {/* Upload Zone */}
                    <section className="bg-white rounded-2xl p-6 shadow-lg">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                            <FiUpload className="text-secondary" />
                            رفع نسخة احتياطية
                        </h2>

                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragActive
                                ? "border-primary bg-primary/5"
                                : "border-gray-300 hover:border-primary/50"
                                }`}
                        >
                            <input
                                type="file"
                                accept=".zip"
                                onChange={handleFileSelect}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />

                            {actionLoading === "upload" ? (
                                <div className="flex flex-col items-center">
                                    <FiRefreshCw className="text-4xl text-primary animate-spin mb-3" />
                                    <p className="text-gray-600 font-medium">جاري رفع الملف...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                                        <FiUpload className="text-3xl text-secondary" />
                                    </div>
                                    <p className="text-gray-800 font-semibold mb-1">
                                        اسحب وأفلت ملف ZIP هنا
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        أو انقر لاختيار الملف
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Backups List */}
                    <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <FiFileText className="text-primary" />
                                النسخ الاحتياطية المتاحة
                                <span className="mr-2 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                                    {backups.length}
                                </span>
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            {backups.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                        <FiDatabase className="text-4xl text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد نسخ احتياطية</h3>
                                    <p className="text-gray-400">قم بإنشاء أول نسخة احتياطية للبدء</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                اسم الملف
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                الحجم
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                تاريخ الإنشاء
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                الإجراءات
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {backups.map((backup, index) => (
                                            <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                            <FiArchive className="text-primary" />
                                                        </div>
                                                        <span className="font-medium text-gray-800 text-sm">
                                                            {backup.file_name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-600">{backup.file_size}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-600 text-sm">
                                                        {new Date(backup.created_at).toLocaleDateString("ar-SA", {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit"
                                                        })}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleDownload(backup.file_name)}
                                                            disabled={actionLoading === `download-${backup.file_name}`}
                                                            className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
                                                            title="تحميل"
                                                        >
                                                            {actionLoading === `download-${backup.file_name}` ? (
                                                                <FiRefreshCw className="animate-spin" />
                                                            ) : (
                                                                <FiDownload />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedBackup(backup.file_name);
                                                                setShowRestoreModal(true);
                                                            }}
                                                            className="p-2 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary hover:text-white transition-colors"
                                                            title="استرجاع"
                                                        >
                                                            <FiPlay />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setDeleteTarget(backup.file_name);
                                                                setShowDeleteModal(true);
                                                            }}
                                                            className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                                            title="حذف"
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </section>
                </div>

                {/* ═══════════════════════════════════════════════════════════
                    RIGHT COLUMN - HISTORY
                ═══════════════════════════════════════════════════════════ */}
                <div className="space-y-8">
                    {/* System Info */}
                    <section className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white shadow-lg">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                            <FiShield />
                            حالة النظام
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-white/80">النسخ التلقائي</span>
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                    نشط
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-white/80">جدولة النسخ</span>
                                <span>كل 3 أيام</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-white/80">التنظيف التلقائي</span>
                                <span>30 يوم</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-white/80">الحد الأقصى</span>
                                <span>5 GB</span>
                            </div>
                        </div>
                    </section>

                    {/* History Timeline */}
                    <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <FiClock className="text-secondary" />
                                سجل العمليات
                            </h2>
                        </div>

                        <div className="p-4 max-h-[500px] overflow-y-auto admin-scrollbar">
                            {history.length === 0 ? (
                                <div className="text-center py-8">
                                    <FiClock className="text-4xl text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-400">لا توجد عمليات مسجلة</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {history.slice(0, 15).map((item, index) => (
                                        <div
                                            key={item.id || index}
                                            className="relative pr-6 pb-4 border-r-2 border-gray-100 last:border-r-0"
                                        >
                                            {/* Timeline dot */}
                                            <span className={`absolute right-0 top-1 w-3 h-3 rounded-full -translate-x-1/2 ${item.status === "success" ? "bg-green-500" :
                                                item.status === "failed" ? "bg-red-500" :
                                                    "bg-yellow-500"
                                                }`}></span>

                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <TypeBadge type={item.type} />
                                                    <StatusBadge status={item.status} />
                                                </div>

                                                {item.file_name && (
                                                    <p className="text-xs text-gray-500 mt-2 truncate" title={item.file_name}>
                                                        📁 {item.file_name}
                                                    </p>
                                                )}

                                                {item.message && (
                                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                        {item.message}
                                                    </p>
                                                )}

                                                <p className="text-xs text-gray-400 mt-2">
                                                    {new Date(item.created_at).toLocaleDateString("ar-SA", {
                                                        month: "short",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                RESTORE CONFIRMATION MODAL
            ═══════════════════════════════════════════════════════════════ */}
            {showRestoreModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-scaleIn">
                        <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                            <FiAlertTriangle className="text-3xl text-yellow-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
                            تأكيد الاسترجاع
                        </h3>
                        <p className="text-gray-600 text-center mb-6">
                            هل أنت متأكد من استرجاع هذه النسخة؟ سيتم إنشاء نسخة وقائية قبل الاسترجاع.
                        </p>
                        <p className="text-sm text-gray-500 text-center mb-6 bg-gray-50 p-3 rounded-lg">
                            📁 {selectedBackup}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRestoreModal(false);
                                    setSelectedBackup(null);
                                }}
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleRestore}
                                disabled={actionLoading === "restore"}
                                className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {actionLoading === "restore" ? (
                                    <>
                                        <FiRefreshCw className="animate-spin" />
                                        جاري...
                                    </>
                                ) : (
                                    <>
                                        <FiPlay />
                                        استرجاع
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                DELETE CONFIRMATION MODAL
            ═══════════════════════════════════════════════════════════════ */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-scaleIn">
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <FiTrash2 className="text-3xl text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
                            تأكيد الحذف
                        </h3>
                        <p className="text-gray-600 text-center mb-6">
                            هل أنت متأكد من حذف هذه النسخة الاحتياطية؟ لا يمكن التراجع عن هذا الإجراء.
                        </p>
                        <p className="text-sm text-gray-500 text-center mb-6 bg-gray-50 p-3 rounded-lg">
                            📁 {deleteTarget}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteTarget(null);
                                }}
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={actionLoading === "delete"}
                                className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {actionLoading === "delete" ? (
                                    <>
                                        <FiRefreshCw className="animate-spin" />
                                        جاري...
                                    </>
                                ) : (
                                    <>
                                        <FiTrash2 />
                                        حذف
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
