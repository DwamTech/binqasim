"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArticleService } from "../services/articleService";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye, FiCheckCircle, FiXCircle, FiMoreVertical, FiUser, FiEyeOff, FiFilter, FiChevronDown, FiCheck } from "react-icons/fi";
import { useToast } from "@/components/admin/ToastProvider";
import { SectionService, Section } from "../services/sectionService";

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
                                className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-gray-50 transition ${
                                    value === opt.value ? "bg-primary/5 text-gray-900" : "text-gray-700"
                                }`}
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

export default function ArticlesPage() {
    const toast = useToast();
    const [allArticles, setAllArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Filters
    const [selectedSection, setSelectedSection] = useState<string>("");
    const [selectedAuthor, setSelectedAuthor] = useState<string>("");
    const [sections, setSections] = useState<Section[]>([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    // Delete Confirmation State
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean, id: number | null, title: string }>({
        show: false,
        id: null,
        title: ''
    });

    // Fetch All on Mount (Smart Full Fetch)
    useEffect(() => {
        fetchArticles();
        fetchSections();
    }, []);

    const fetchSections = async () => {
        try {
            const data = await SectionService.getAll();
            setSections(data);
        } catch (err) {
            console.error("Failed to fetch sections", err);
        }
    };

    const fetchArticles = async () => {
        setLoading(true);
        try {
            // 1. Fetch first page to assess total data size
            const res = await ArticleService.getAll(1, "", 15); // Use standard chunks

            let initialData = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
            const lastPage = res.last_page || 1;

            // Show first page immediately for better UX
            setAllArticles(initialData);
            setLoading(false);

            // 2. If more pages exist, fetch them all in parallel to build local cache
            if (lastPage > 1) {
                // Create promises for pages 2 to lastPage
                const promises = [];
                for (let i = 2; i <= lastPage; i++) {
                    promises.push(ArticleService.getAll(i, "", 15));
                }

                // Wait for all
                const results = await Promise.all(promises);

                let moreData: any[] = [];
                // Combine data
                results.forEach(r => {
                    const pageData = Array.isArray(r.data) ? r.data : (Array.isArray(r) ? r : []);
                    moreData.push(...pageData);
                });

                // Update state with remaining data + deduplicate
                setAllArticles(prev => {
                    const combined = [...prev, ...moreData];
                    return Array.from(new Map(combined.map((item: any) => [item.id, item])).values());
                });
            }

        } catch (err) {
            console.error("Failed to fetch articles", err);
            setLoading(false);
        }
    };

    // Client-Side Search & Filtering Logic
    const filteredArticles = allArticles
        .filter(article => {
            // Search filter
            const matchesSearch = article.title?.toLowerCase().includes(search.toLowerCase()) ||
                article.author_name?.toLowerCase().includes(search.toLowerCase());

            // Section filter
            const matchesSection = !selectedSection || article.section_id?.toString() === selectedSection;

            // Author filter
            const matchesAuthor = !selectedAuthor || article.author_name === selectedAuthor;

            return matchesSearch && matchesSection && matchesAuthor;
        })
        .sort((a, b) => b.id - a.id); // Sort by Newest (Highest ID)

    // Get unique authors from all articles
    const uniqueAuthors = Array.from(new Set(allArticles.map(a => a.author_name).filter(Boolean)));
    uniqueAuthors.sort();

    const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE) || 1;
    const paginatedArticles = filteredArticles.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset to page 1 when search or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedSection, selectedAuthor]);

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
            await ArticleService.delete(deleteConfirm.id);
            // Refresh local data by removing the item
            setAllArticles(prev => prev.filter(a => a.id !== deleteConfirm.id));
            toast.success('تم حذف المقال بنجاح');
        } catch (err) {
            toast.error('فشل حذف المقال');
        } finally {
            setDeleteConfirm({ show: false, id: null, title: '' });
        }
    };

    const toggleStatus = async (id: number, currentStatus: string) => {
        try {
            const response = await ArticleService.toggleStatus(id);
            const newStatus = response.article?.status || (currentStatus === 'published' ? 'draft' : 'published');

            // Optimistic update
            setAllArticles(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
            toast.success(`تم ${newStatus === 'published' ? 'نشر' : 'إيقاف نشر'} المقال بنجاح`);
        } catch (err) {
            console.error(err);
            toast.error('فشل تغيير حالة المقال');
        }
    };

    const [showDemoRow, setShowDemoRow] = useState(true);
    const [demoArticle, setDemoArticle] = useState({
        id: -1,
        title: 'مقال تجريبي',
        slug: 'demo-article',
        author_name: 'كاتب تجريبي',
        section: { name: 'قسم تجريبي' },
        status: 'published',
        gregorian_date: '2026-01-01'
    } as any);

    const toggleStatusDemo = () => {
        setDemoArticle(prev => {
            const nextStatus = prev.status === 'published' ? 'draft' : 'published';
            toast.success(`تم ${nextStatus === 'published' ? 'نشر' : 'إيقاف نشر'} المقال التجريبي`);
            return { ...prev, status: nextStatus };
        });
    };

    const handleDeleteDemo = () => {
        setShowDemoRow(false);
        toast.success('تم حذف المقال التجريبي');
    };
    const preDeleteDemo = () => {
        toast.warning('سيتم حذف المقال التجريبي');
        setTimeout(() => handleDeleteDemo(), 500);
    };

    const displayRows = filteredArticles.length > 0 ? filteredArticles : (showDemoRow ? [demoArticle] : []);
    const totalCount = displayRows.length;
    const publishedCount = displayRows.filter(a => a.status === "published").length;
    const draftCount = displayRows.filter(a => a.status !== "published").length;
    const sectionsCount = Array.from(new Set(displayRows.map(a => a.section?.name).filter(Boolean))).length;
    const authorsCount = Array.from(new Set(displayRows.map(a => a.author_name).filter(Boolean))).length;

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
                            <span>إدارة المقالات</span>
                        </div>
                        <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                            تحكم مرئي وذكي في المقالات
                        </h1>
                        <p className="mt-2 text-gray-700">
                            إنشاء، فلترة، ونشر المقالات بسهولة وتصميم متفاعل.
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <Link href="/admin/articles/create" className="inline-flex items-center gap-2 rounded-xl bg-primary text-white px-4 py-2 shadow-sm transition hover:shadow-md">
                                <FiPlus />
                                إضافة مقال جديد
                            </Link>
                            {/* <a href="#filters" className="inline-flex items-center gap-2 rounded-xl bg-secondary text-white px-4 py-2 shadow-sm transition hover:shadow-md">
                                أدوات الفلترة
                            </a> */}
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl bg-white/70 backdrop-blur-md p-4 shadow-sm">
                        <p className="text-xs text-gray-600">إجمالي المقالات</p>
                        <p className="text-xl font-bold text-gray-800">{totalCount}</p>
                    </div>
                    <div className="rounded-xl bg-white/70 backdrop-blur-md p-4 shadow-sm">
                        <p className="text-xs text-gray-600">منشورة</p>
                        <p className="text-xl font-bold text-gray-800">{publishedCount}</p>
                    </div>
                    <div className="rounded-xl bg-white/70 backdrop-blur-md p-4 shadow-sm">
                        <p className="text-xs text-gray-600">مسودات</p>
                        <p className="text-xl font-bold text-gray-800">{draftCount}</p>
                    </div>
                    <div className="rounded-xl bg-white/70 backdrop-blur-md p-4 shadow-sm">
                        <p className="text-xs text-gray-600">الأقسام والكتاب</p>
                        <p className="text-xl font-bold text-gray-800">{sectionsCount} قسم • {authorsCount} كاتب</p>
                    </div>
                </div>
            </section>

            <div id="filters" className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-6 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm flex items-center">
                    <FiSearch className="text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="بحث عن مقال بالعنوان أو الكاتب..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 px-3 text-sm"
                    />
                </div>

                <FancySelect
                    value={selectedSection}
                    onChange={setSelectedSection}
                    options={[{ label: "كل الأقسام", value: "" }, ...sections.map(s => ({ label: s.name, value: String(s.id) }))]}
                    placeholder="اختر القسم"
                    className="md:col-span-3"
                />

                <FancySelect
                    value={selectedAuthor}
                    onChange={setSelectedAuthor}
                    options={[{ label: "كل الكُتاب", value: "" }, ...uniqueAuthors.map(a => ({ label: a, value: a }))]}
                    placeholder="اختر الكاتب"
                    className="md:col-span-3"
                />
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5">
                        <FiSearch className="text-primary" />
                        <span className="text-xs text-primary">إجمالي النتائج</span>
                        <span className="text-lg font-bold text-primary">{filteredArticles.length}</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">المقال</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">الكاتب</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">القسم</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">الحالة</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">تاريخ النشر</th>
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
                            ) : filteredArticles.length === 0 ? (
                                showDemoRow ? (
                                <tr className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-800 line-clamp-1" title={demoArticle.title}>
                                                {demoArticle.title}
                                            </span>
                                            <span className="text-xs text-gray-400 mt-0.5">{demoArticle.slug}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                                <FiUser />
                                            </div>
                                            {demoArticle.author_name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs">
                                            {demoArticle.section?.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {demoArticle.status === 'published' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-100">
                                                <FiCheckCircle size={12} />
                                                منشور
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-600 border-gray-200">
                                                <FiXCircle size={12} />
                                                مسودة
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dir-ltr text-right">
                                        {demoArticle.gregorian_date}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="relative group">
                                                <button
                                                    onClick={toggleStatusDemo}
                                                    className={`p-1.5 rounded-md transition-all ${demoArticle.status === 'published'
                                                        ? 'text-red-600 hover:bg-red-50'
                                                        : 'text-green-600 hover:bg-green-50'
                                                        }`}
                                                    title={demoArticle.status === 'published' ? 'إيقاف النشر' : 'نشر المقال'}
                                                >
                                                    {demoArticle.status === 'published' ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                                </button>
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                                    {demoArticle.status === 'published' ? 'إيقاف نشر المقال' : 'نشر المقال'}
                                                </div>
                                            </div>
                                            <Link
                                                href={`/admin/articles/edit/${demoArticle.id}`}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                title="تعديل المقال التجريبي"
                                            >
                                                <FiEdit2 size={16} />
                                            </Link>
                                            <button
                                                onClick={preDeleteDemo}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title="حذف المقال التجريبي"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        لا توجد مقالات
                                    </td>
                                </tr>
                                )
                            ) : (
                                paginatedArticles.map((article) => (
                                    <tr key={article.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-800 line-clamp-1" title={article.title}>
                                                    {article.title}
                                                </span>
                                                <span className="text-xs text-gray-400 mt-0.5">{article.slug}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                                    <FiUser />
                                                </div>
                                                {article.author_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs">
                                                {article.section?.name || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${article.status === 'published'
                                                ? 'bg-green-50 text-green-700 border-green-100'
                                                : 'bg-gray-100 text-gray-600 border-gray-200'
                                                }`}>
                                                {article.status === 'published' ? <FiCheckCircle size={12} /> : <FiXCircle size={12} />}
                                                {article.status === 'published' ? 'منشور' : 'مسودة'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dir-ltr text-right">
                                            {article.gregorian_date || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {/* Toggle Status Button */}
                                                <div className="relative group">
                                                    <button
                                                        onClick={() => toggleStatus(article.id, article.status)}
                                                        className={`p-1.5 rounded-md transition-all ${article.status === 'published'
                                                            ? 'text-red-600 hover:bg-red-50'
                                                            : 'text-green-600 hover:bg-green-50'
                                                            }`}
                                                        title={article.status === 'published' ? 'إيقاف النشر' : 'نشر المقال'}
                                                    >
                                                        {article.status === 'published' ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                                    </button>
                                                    {/* Tooltip */}
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                                        {article.status === 'published' ? 'إيقاف نشر المقال' : 'نشر المقال'}
                                                    </div>
                                                </div>

                                                {/* Edit Button */}
                                                <Link
                                                    href={`/admin/articles/edit/${article.id}`}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    title="تعديل"
                                                >
                                                    <FiEdit2 size={16} />
                                                </Link>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleDelete(article.id, article.title)}
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

                {/* Pagination Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                        عرض الصفحة {currentPage} من {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1 || loading}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            السابق
                        </button>
                        <div className="flex gap-1">
                            {/* Simple Logic: Just show numbers if few, or simpler logic */}
                            {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
                                // A very basic pager: 1,2,3,4,5 or sliding window is better but complex. 
                                // Let's keep it simple: just Prev/Next for now is safest, or dynamic.
                                // Let's try to map around current page.
                                let p = currentPage - 2 + idx;
                                if (currentPage < 3) p = 1 + idx;
                                if (p > totalPages) return null;
                                if (p < 1) return null;

                                return (
                                    <button
                                        key={p}
                                        onClick={() => handlePageChange(p)}
                                        className={`w-8 h-8 flex items-center justify-center text-sm rounded-md border ${p === currentPage
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-white border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages || loading}
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
                                هل أنت متأكد من حذف المقال:
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
