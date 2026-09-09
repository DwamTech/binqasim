"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { BookService } from "../services/bookService";
import { SeriesService, Series } from "../services/seriesService";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiBook, FiUser, FiFilter, FiChevronDown, FiCheck } from "react-icons/fi";
import { useToast } from "@/components/admin/ToastProvider";

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
    const ref = useRef<HTMLDivElement | null>(null);

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

export default function BooksPage() {
    const toast = useToast();
    const [allBooks, setAllBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Filters
    const [selectedSeries, setSelectedSeries] = useState<string>("");
    const [selectedAuthor, setSelectedAuthor] = useState<string>("");
    const [selectedType, setSelectedType] = useState<string>("");
    const [series, setSeries] = useState<Series[]>([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    // Delete Confirmation State
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean, id: number | null, title: string }>({
        show: false,
        id: null,
        title: ''
    });

    // Fetch All on Mount
    useEffect(() => {
        fetchBooks();
        fetchSeries();
    }, []);

    const fetchSeries = async () => {
        try {
            const data = await SeriesService.getAll();
            setSeries(data);
        } catch (err) {
            console.error("Failed to fetch series", err);
        }
    };

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const res = await BookService.getAll(1, "", 1000); // Fetch all for client-side filtering
            let initialData = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
            setAllBooks(initialData);
        } catch (err) {
            console.error("Failed to fetch books", err);
            toast.error("فشل تحميل الكتب");
        } finally {
            setLoading(false);
        }
    };

    // Client-Side Search & Filtering Logic
    const filteredBooks = allBooks
        .filter(book => {
            // Search filter
            const matchesSearch = book.title?.toLowerCase().includes(search.toLowerCase()) ||
                book.author_name?.toLowerCase().includes(search.toLowerCase());

            // Series filter
            const matchesSeries = !selectedSeries || book.book_series_id?.toString() === selectedSeries;

            // Author filter
            const matchesAuthor = !selectedAuthor || book.author_name === selectedAuthor;

            // Type filter
            const matchesType = !selectedType || book.type === selectedType;

            return matchesSearch && matchesSeries && matchesAuthor && matchesType;
        })
        .sort((a, b) => b.id - a.id);

    // Get unique authors
    const uniqueAuthors = Array.from(new Set(allBooks.map(b => b.author_name).filter(Boolean)));
    uniqueAuthors.sort();

    const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE) || 1;
    const paginatedBooks = filteredBooks.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedSeries, selectedAuthor, selectedType]);

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
            await BookService.delete(deleteConfirm.id);
            setAllBooks(prev => prev.filter(b => b.id !== deleteConfirm.id));
            toast.success('تم حذف الكتاب بنجاح');
        } catch (err) {
            toast.error('فشل حذف الكتاب');
        } finally {
            setDeleteConfirm({ show: false, id: null, title: '' });
        }
    };

    const totalCount = allBooks.length;
    const authorsCount = uniqueAuthors.length;
    const seriesCount = series.length;

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
                            <span>إدارة الكتب</span>
                        </div>
                        <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                            تنظيم احترافي لمحتوى المكتبة
                        </h1>
                        <p className="mt-2 text-gray-700">
                            فلترة وعرض وتحرير الكتب بسهولة وواجهة أنيقة.
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <Link href="/admin/books/create" className="inline-flex items-center gap-2 rounded-xl bg-primary text-white px-4 py-2 shadow-sm transition hover:shadow-md ">
                                <FiPlus />
                                إضافة كتاب
                            </Link>
                            {/* <a href="#filters" className="inline-flex items-center gap-2 rounded-xl bg-secondary text-white px-4 py-2 shadow-sm transition hover:shadow-md">
                                أدوات الفلترة
                            </a> */}
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl bg-white/70 backdrop-blur-md p-4 shadow-sm">
                        <p className="text-xs text-gray-600">إجمالي الكتب</p>
                        <p className="text-xl font-bold text-gray-800">{totalCount}</p>
                    </div>
                    <div className="rounded-xl bg-white/70 backdrop-blur-md p-4 shadow-sm">
                        <p className="text-xs text-gray-600">المؤلفون</p>
                        <p className="text-xl font-bold text-gray-800">{authorsCount}</p>
                    </div>
                    <div className="rounded-xl bg-white/70 backdrop-blur-md p-4 shadow-sm">
                        <p className="text-xs text-gray-600">السلاسل</p>
                        <p className="text-xl font-bold text-gray-800">{seriesCount}</p>
                    </div>
                    <div className="rounded-xl bg-white/70 backdrop-blur-md p-4 shadow-sm">
                        <p className="text-xs text-gray-600">نتائج البحث الحالية</p>
                        <p className="text-xl font-bold text-gray-800">{filteredBooks.length}</p>
                    </div>
                </div>
            </section>

            {/* Search & Filters */}
            <div id="filters" className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-6 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm flex items-center">
                    <FiSearch className="text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="بحث عن كتاب بالعنوان أو المؤلف..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 px-3 text-sm"
                    />
                </div>

                <FancySelect
                    value={selectedSeries}
                    onChange={setSelectedSeries}
                    options={[{ label: "كل السلاسل", value: "" }, ...series.map(s => ({ label: s.name, value: String(s.id) }))]}
                    placeholder="اختر السلسلة"
                    className="md:col-span-2"
                />

                <FancySelect
                    value={selectedAuthor}
                    onChange={setSelectedAuthor}
                    options={[{ label: "كل المؤلفين", value: "" }, ...uniqueAuthors.map(a => ({ label: a, value: a }))]}
                    placeholder="اختر المؤلف"
                    className="md:col-span-2"
                />

                <FancySelect
                    value={selectedType}
                    onChange={setSelectedType}
                    options={[
                        { label: "كل الأنواع", value: "" },
                        { label: "مستقل", value: "single" },
                        { label: "جزء من سلسلة", value: "part" },
                    ]}
                    placeholder="اختر النوع"
                    className="md:col-span-2"
                />
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5">
                        <FiSearch className="text-primary" />
                        <span className="text-xs text-primary">إجمالي النتائج</span>
                        <span className="text-lg font-bold text-primary">{filteredBooks.length}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                        عرض الصفحة {currentPage} من {totalPages}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">الكتاب</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">المؤلف</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">النوع</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">المصدر</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        جاري التحميل...
                                    </td>
                                </tr>
                            ) : filteredBooks.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        لا توجد كتب
                                    </td>
                                </tr>
                            ) : (
                                paginatedBooks.map((book) => (
                                    <tr key={book.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded flex items-center justify-center">
                                                    <FiBook className="text-primary" size={20} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-800 line-clamp-1">
                                                        {book.title}
                                                    </span>
                                                    {book.series && (
                                                        <span className="text-xs text-gray-400">{book.series.name}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <FiUser className="text-gray-400" size={14} />
                                                {book.author_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs ${book.type === 'single'
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'bg-purple-50 text-purple-700'
                                                }`}>
                                                {book.type === 'single' ? 'مستقل' : 'سلسلة'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs">
                                                {book.source_type === 'file' ? 'ملف' : book.source_type === 'link' ? 'رابط' : 'مضمن'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/books/edit/${book.id}`}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    title="تعديل"
                                                >
                                                    <FiEdit2 size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(book.id, book.title)}
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

            {/* Delete Confirmation Modal */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-[slideDown_0.3s_ease-out]">
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
                            <p className="text-gray-700">
                                هل أنت متأكد من حذف الكتاب:
                            </p>
                            <p className="font-semibold text-gray-900 mt-2 p-3 bg-gray-50 rounded-lg">
                                {deleteConfirm.title}
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
