"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SupportService, SupportRequest } from "@/app/admin/services/supportService";
import StatusBadge from "@/components/admin/StatusBadge";
import { FiSearch, FiEye, FiUser, FiPhone, FiCalendar, FiFilter, FiChevronDown, FiCheck } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useToast } from "@/components/admin/ToastProvider";
import SupportToggle from "@/components/admin/SupportToggle";
import { usePendingCounts } from "@/contexts/PendingCountsContext";
import DataExportPanel from "@/components/admin/DataExportPanel";

type FancySelectOption = { label: string; value: string };

function FancySelect({
    value,
    onChange,
    options,
    placeholder,
    className
}: {
    value: string;
    onChange: (v: string) => void;
    options: FancySelectOption[];
    placeholder: string;
    className?: string;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const ref = React.useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    const selectedLabel = options.find(o => o.value === value)?.label || "";
    const filtered = options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));

    return (
        <div ref={ref} className={`relative ${className || ""}`}>
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm text-gray-700 flex items-center justify-between hover:border-primary/40 hover:shadow transition"
            >
                <span className={`line-clamp-1 ${selectedLabel ? "text-gray-800" : "text-gray-400"}`}>
                    {selectedLabel || placeholder}
                </span>
                <FiChevronDown className="text-gray-400" />
            </button>
            {open && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 border-b bg-gray-50">
                        <FiSearch className="text-gray-400" size={14} />
                        <input
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="بحث داخل الخيارات..."
                            className="flex-1 bg-transparent outline-none text-xs text-gray-700"
                        />
                    </div>
                    <ul className="max-h-56 overflow-y-auto admin-scrollbar">
                        {filtered.map((opt) => (
                            <li
                                key={opt.value}
                                onMouseDown={() => {
                                    onChange(opt.value);
                                    setOpen(false);
                                    setQuery("");
                                }}
                                className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-gray-50 transition ${value === opt.value ? "bg-primary/5 text-gray-900" : "text-gray-700"}`}
                            >
                                <span className="line-clamp-1">{opt.label}</span>
                                {value === opt.value && <FiCheck className="text-primary" />}
                            </li>
                        ))}
                        {filtered.length === 0 && (
                            <li className="px-3 py-3 text-xs text-gray-500">لا توجد نتائج مطابقة</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default function InstitutionalRequestsPage() {
    const toast = useToast();
    const [requests, setRequests] = useState<SupportRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Pending Counts for Tab Title
    const { counts } = usePendingCounts();

    useEffect(() => {
        if (counts?.institutional?.total_action_needed) {
            document.title = `(${counts.institutional.total_action_needed}) طلبات دعم المؤسسات`;
        } else {
            document.title = "طلبات دعم المؤسسات";
        }
    }, [counts]);

    useEffect(() => {
        fetchRequests();
    }, [currentPage, statusFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

    const exportMapping = {
        id: "ID",
        request_number: "رقم الطلب",
        institution_name: "اسم المؤسسة",
        license_number: "رقم الترخيص",
        email: "البريد الإلكتروني",
        phone_number: "رقم الهاتف",
        ceo_name: "اسم المدير التنفيذي",
        ceo_mobile: "جوال المدير التنفيذي",
        whatsapp_number: "رقم الواتساب",
        city: "المدينة",
        activity_type: "نوع النشاط",
        activity_type_other: "نوع نشاط آخر",
        project_name: "اسم المشروع",
        project_type: "نوع المشروع",
        project_type_other: "نوع مشروع آخر",
        project_manager_name: "اسم مدير المشروع",
        project_manager_mobile: "جوال مدير المشروع",
        goal_1: "الهدف الأول",
        goal_2: "الهدف الثاني",
        goal_3: "الهدف الثالث",
        goal_4: "الهدف الرابع",
        other_goals: "أهداف أخرى",
        beneficiaries: "المستفيدين",
        beneficiaries_other: "مستفيدين آخرين",
        project_cost: "تكلفة المشروع",
        project_outputs: "مخرجات المشروع",
        support_scope: "نطاق الدعم",
        amount_requested: "المبلغ المطلوب",
        account_name: "اسم الحساب البنكي",
        bank_name: "اسم البنك",
        bank_account_iban: "IBAN",
        status: "حالة الطلب",
        rejection_reason: "سبب الرفض",
        admin_response_message: "رد الإدارة",
        created_at: "تاريخ التقديم",
        updated_at: "تاريخ التحديث"
    };

    const fetchExportData = async (start: string, end: string) => {
        const res = await SupportService.institutional.getAllForExport(start, end);
        return res.data || res; // Adjust based on actual API response
    };

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await SupportService.institutional.getAll(currentPage, statusFilter, search);
            setRequests(data.data || []);
            setTotalPages(data.meta?.last_page || 1);
        } catch (err) {
            console.error(err);
            toast.error("فشل تحميل الطلبات");
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleSearch = () => {
        fetchRequests();
    };

    return (
        <div className="space-y-6">
            <section className="animated-hero relative overflow-hidden rounded-2xl p-6 md:p-8">
                <div className="absolute inset-0 pointer-events-none hero-grid"></div>
                <span className="hero-blob hero-blob-1"></span>
                <span className="hero-blob hero-blob-2"></span>
                <span className="hero-dot hero-dot-1"></span>
                <span className="hero-dot hero-dot-2"></span>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md text-xs font-semibold text-gray-700">
                            <FiFilter className="text-primary" />
                            <span>إدارة طلبات المؤسسات</span>
                        </div>
                        <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                            متابعة احترافية لطلبات دعم المؤسسات
                        </h1>
                        <p className="mt-2 text-gray-700">
                            ابحث وفلتر الطلبات بسرعة، وتابع الحالات بكل سهولة.
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        <SupportToggle />
                    </div>
                </div>
            </section>

            {/* Export Section */}
            <DataExportPanel
                onFetchData={fetchExportData}
                fieldMapping={exportMapping}
                title="تقرير طلبات دعم المؤسسات"
                fileName="Institutional_Support_Report"
            />

            {/* Filters - Grouped Section */}
            <div id="filters" className="rounded-xl border border-gray-200 shadow-sm p-4 bg-gradient-to-r from-primary/50 to-secondary/10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <div className="md:col-span-7 flex items-center px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm bg-white">
                        <FiSearch className="text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="بحث برقم الطلب، اسم المؤسسة، أو رقم الهاتف..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 px-3 text-sm"
                        />
                        <button
                            onClick={handleSearch}
                            className="px-3 py-1 bg-primary text-white rounded-md text-sm hover:bg-primary/90 transition-colors"
                        >
                            بحث
                        </button>
                    </div>

                    <FancySelect
                        className="md:col-span-5"
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={[
                            { label: "كل الحالات", value: "" },
                            { label: "تحت المراجعة", value: "pending" },
                            { label: "بانتظار المرفقات", value: "waiting_for_documents" },
                            { label: "مراجعة المرفقات", value: "documents_review" },
                            { label: "مكتمل", value: "completed" },
                            { label: "مرفوض", value: "rejected" },
                            { label: "مؤرشف", value: "archived" },
                        ]}
                        placeholder="اختر الحالة"
                    />

                    {/* <div className="md:col-span-1 px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center bg-white">
                        <span className="text-xs text-gray-500">النتائج</span>
                        <span className="text-lg font-bold text-primary">{requests.length}</span>
                    </div> */}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5">
                        <FiSearch className="text-primary" />
                        <span className="text-xs text-primary">إجمالي النتائج</span>
                        <span className="text-lg font-bold text-primary">{requests.length}</span>
                    </div>
                </div>
                <div className="hidden md:block">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">رقم الطلب</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">اسم المؤسسة</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">الهاتف</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">الحالة</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">تاريخ التقديم</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            جاري التحميل...
                                        </td>
                                    </tr>
                                ) : requests.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            لا توجد طلبات
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((request) => (
                                        <tr key={request.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-mono text-gray-900 font-medium">
                                                    {request.request_number}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FiUser className="text-gray-400" size={14} />
                                                    <span className="text-sm text-gray-900">{request.institution_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FiPhone className="text-gray-400" size={14} />
                                                    <span className="text-sm text-gray-600 font-mono">{request.phone_number}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={request.status} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FiCalendar className="text-gray-400" size={14} />
                                                    <span className="text-sm text-gray-600">
                                                        {new Date(request.created_at).toLocaleDateString('ar-EG')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={`tel:${request.phone_number}`}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                                        title="اتصال"
                                                    >
                                                        <FiPhone size={16} />
                                                    </a>
                                                    <a
                                                        href={`https://wa.me/${request.phone_number.replace(/[^0-9]/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                                        title="واتساب"
                                                    >
                                                        <FaWhatsapp size={16} />
                                                    </a>
                                                    <Link
                                                        href={`/admin/support-institutions/${request.id}`}
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    >
                                                        <FiEye size={16} />
                                                        عرض التفاصيل
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="p-3 md:hidden">
                    {loading ? (
                        <div className="px-3 py-6 text-center text-gray-500">جاري التحميل...</div>
                    ) : requests.length === 0 ? (
                        <div className="px-3 py-6 text-center text-gray-500">لا توجد طلبات</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {requests.map((request) => (
                                <div key={request.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-mono text-gray-900 font-medium">{request.request_number}</span>
                                        <StatusBadge status={request.status} />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <FiUser className="text-gray-400" size={14} />
                                            <span className="text-sm text-gray-900">{request.institution_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FiPhone className="text-gray-400" size={14} />
                                            <span className="text-sm text-gray-600 font-mono">{request.phone_number}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FiCalendar className="text-gray-400" size={14} />
                                            <span className="text-sm text-gray-600">
                                                {new Date(request.created_at).toLocaleDateString('ar-EG')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3">
                                        <a
                                            href={`tel:${request.phone_number}`}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                            title="اتصال"
                                        >
                                            <FiPhone size={16} />
                                        </a>
                                        <a
                                            href={`https://wa.me/${request.phone_number.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                            title="واتساب"
                                        >
                                            <FaWhatsapp size={16} />
                                        </a>
                                        <Link
                                            href={`/admin/support-institutions/${request.id}`}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                        >
                                            <FiEye size={16} />
                                            عرض التفاصيل
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                        عرض الصفحة {currentPage} من {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            السابق
                        </button>

                        {/* Page Numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`px-3 py-1 text-sm border rounded-md transition-colors ${currentPage === pageNum
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            التالي
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
