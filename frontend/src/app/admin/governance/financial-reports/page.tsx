"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DocumentService, Document } from "@/app/admin/services/documentService";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiDownload, FiEye, FiFile } from "react-icons/fi";
import { useToast } from "@/components/admin/ToastProvider";

export default function FinancialReportsPage() {
    const toast = useToast();
    const [allDocuments, setAllDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean, id: number | null, title: string }>({
        show: false,
        id: null,
        title: ''
    });

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const res = await DocumentService.getAll(1, "", 100); // Fetch all
            let data = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);

            // Filter to show only financial reports (you can add custom field or use keywords)
            // For now, we'll show all documents, but you can filter by keywords
            setAllDocuments(data);
        } catch (err) {
            console.error(err);
            toast.error("فشل تحميل التقارير المالية");
        } finally {
            setLoading(false);
        }
    };

    const filteredDocuments = allDocuments
        .filter(doc => {
            const matchesSearch = doc.title?.toLowerCase().includes(search.toLowerCase()) ||
                doc.description?.toLowerCase().includes(search.toLowerCase());
            return matchesSearch;
        })
        .sort((a, b) => b.id - a.id);

    const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE) || 1;
    const paginatedDocuments = filteredDocuments.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleDelete = async (id: number, title: string) => {
        setDeleteConfirm({ show: true, id, title });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.id) return;

        try {
            await DocumentService.delete(deleteConfirm.id);
            setAllDocuments(prev => prev.filter(d => d.id !== deleteConfirm.id));
            toast.success('تم حذف التقرير بنجاح');
        } catch (err) {
            toast.error('فشل حذف التقرير');
        } finally {
            setDeleteConfirm({ show: false, id: null, title: '' });
        }
    };

    const handleDownload = async (id: number) => {
        try {
            const result = await DocumentService.registerDownload(id);
            window.open(result.download_url, '_blank');
        } catch (err) {
            toast.error('فشل تحميل الملف');
        }
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
                            <span>إدارة التقارير المالية</span>
                        </div>
                        <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                            عرض احترافي للتقارير المالية
                        </h1>
                        <p className="mt-2 text-gray-700">
                            ابحث وأدر التقارير المالية بسهولة ووضوح.
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        <Link
                            href="/admin/governance/financial-reports/create"
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            <FiPlus size={18} />
                            <span>إضافة تقرير مالي</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Search */}
            <div className="rounded-xl border border-gray-200 shadow-sm p-4 bg-gradient-to-r from-primary/50 to-secondary/10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <div className="md:col-span-10 flex items-center px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm bg-white">
                        <FiSearch className="text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="بحث في التقارير المالية..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 px-3 text-sm"
                        />
                    </div>
                    <div className="md:col-span-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center">
                        <span className="text-xs text-gray-500">إجمالي</span>
                        <span className="text-lg font-bold text-primary">{filteredDocuments.length}</span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition hover:shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">الملف</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">النوع</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">الحجم</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">المشاهدات</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">التحميلات</th>
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
                            ) : filteredDocuments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        لا توجد تقارير مالية
                                    </td>
                                </tr>
                            ) : (
                                paginatedDocuments.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="text-2xl">{DocumentService.getFileIcon(doc.file_type || 'file')}</div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-800 line-clamp-1" title={doc.title}>
                                                        {doc.title}
                                                    </span>
                                                    {doc.description && (
                                                        <span className="text-xs text-gray-400 line-clamp-1">{doc.description}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium uppercase">
                                                {doc.file_type || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {doc.file_size ? DocumentService.formatFileSize(doc.file_size) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <FiEye size={14} className="text-gray-400" />
                                                {doc.views_count}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <FiDownload size={14} className="text-gray-400" />
                                                {doc.downloads_count}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {doc.source_type === 'file' && (
                                                    <button
                                                        onClick={() => handleDownload(doc.id)}
                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                                        title="تحميل"
                                                    >
                                                        <FiDownload size={16} />
                                                    </button>
                                                )}
                                                <Link
                                                    href={`/admin/governance/financial-reports/edit/${doc.id}`}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    title="تعديل"
                                                >
                                                    <FiEdit2 size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(doc.id, doc.title)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    title="حذف"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
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

            {/* Delete Modal */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <FiTrash2 className="text-red-600" size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">تأكيد الحذف</h3>
                                <p className="text-sm text-gray-500">هذا الإجراء لا يمكن التراجع عنه</p>
                            </div>
                        </div>
                        <div className="mb-6">
                            <p className="text-gray-700">هل أنت متأكد من حذف التقرير:</p>
                            <p className="font-semibold text-gray-900 mt-2 p-3 bg-gray-50 rounded-lg">
                                "{deleteConfirm.title}"
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm({ show: false, id: null, title: '' })}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <FiTrash2 size={18} />
                                حذف نهائياً
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
