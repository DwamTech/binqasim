"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent, useRef } from "react";
import { BookService } from "@/app/admin/services/bookService";
import { SeriesService, Series } from "@/app/admin/services/seriesService";
import { FiSave, FiImage, FiType, FiUser, FiBook, FiLink, FiUpload, FiPlus, FiSearch, FiChevronDown, FiCheck } from "react-icons/fi";
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

interface BookFormProps {
    mode: 'create' | 'edit';
    bookId?: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function BookForm({ mode, bookId, onSuccess, onCancel }: BookFormProps) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(mode === 'edit');

    // Book Details
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [authorName, setAuthorName] = useState("");
    const [keywords, setKeywords] = useState("");

    // Source Fields
    const [sourceType, setSourceType] = useState<'file' | 'link' | 'embed'>('file');
    const [bookFile, setBookFile] = useState<File | null>(null);
    const [sourceLink, setSourceLink] = useState("");
    const [existingFilePath, setExistingFilePath] = useState("");

    // Cover Fields
    const [coverType, setCoverType] = useState<'auto' | 'upload'>('auto');
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [existingCoverPath, setExistingCoverPath] = useState("");

    // Type & Series
    const [bookType, setBookType] = useState<'single' | 'part'>('single');
    const [selectedSeries, setSelectedSeries] = useState<string>("");

    // Data from API
    const [authors, setAuthors] = useState<string[]>([]);
    const [series, setSeries] = useState<Series[]>([]);
    const [filteredAuthors, setFilteredAuthors] = useState<string[]>([]);
    const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);

    // Add Series Modal
    const [showSeriesForm, setShowSeriesForm] = useState(false);
    const [addingSeriesLoading, setAddingSeriesLoading] = useState(false);
    const [newSeriesName, setNewSeriesName] = useState("");
    const [newSeriesDesc, setNewSeriesDesc] = useState("");

    // Helper to build full image URL
    const getFullImageUrl = (path: string) => {
        if (!path) return null;
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
        const baseUrl = apiBase.replace('/api', '');
        return `${baseUrl}/storage/${path}`;
    };

    useEffect(() => {
        fetchInitialData();
        if (mode === 'edit' && bookId) {
            fetchBookData();
        }
    }, [mode, bookId]);

    const fetchInitialData = async () => {
        try {
            const [authorsData, seriesData] = await Promise.all([
                BookService.getAuthors(),
                SeriesService.getAll()
            ]);
            setAuthors(authorsData);
            setSeries(seriesData);
        } catch (err) {
            console.error(err);
            toast.error("فشل تحميل البيانات الأولية");
        }
    };

    const fetchBookData = async () => {
        if (!bookId) return;

        setInitialLoading(true);
        try {
            const book = await BookService.getById(bookId);

            setTitle(book.title || "");
            setDescription(book.description || "");
            setAuthorName(book.author_name || "");
            setSourceType(book.source_type || 'file');
            setSourceLink(book.source_link || "");
            setCoverType(book.cover_type || 'auto');
            setBookType(book.type || 'single');
            setSelectedSeries(book.book_series_id?.toString() || "");

            if (book.keywords && Array.isArray(book.keywords)) {
                setKeywords(book.keywords.join(', '));
            }

            if (book.file_path) setExistingFilePath(book.file_path);
            if (book.cover_path) {
                setExistingCoverPath(book.cover_path);
                const fullCoverUrl = getFullImageUrl(book.cover_path);
                setCoverPreview(fullCoverUrl);
            }

        } catch (err: any) {
            console.error("Error fetching book:", err);
            toast.error(err.message || "فشل تحميل بيانات الكتاب");
        } finally {
            setInitialLoading(false);
        }
    };

    const handleAuthorChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAuthorName(value);

        if (value.trim()) {
            const filtered = authors.filter(a =>
                a.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredAuthors(filtered);
            setShowAuthorDropdown(true);
        } else {
            setShowAuthorDropdown(false);
        }
    };

    const selectAuthor = (author: string) => {
        setAuthorName(author);
        setShowAuthorDropdown(false);
    };

    const handleBookFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setBookFile(e.target.files[0]);
        }
    };

    const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleAddSeries = async () => {
        if (!newSeriesName.trim()) {
            toast.error("الرجاء إدخال اسم السلسلة");
            return;
        }

        setAddingSeriesLoading(true);
        try {
            const response = await SeriesService.create({
                name: newSeriesName,
                description: newSeriesDesc
            });

            const newSeries = response.data || response;

            if (!newSeries || !newSeries.id) {
                throw new Error("Invalid response format");
            }

            setSeries(prev => [...prev, newSeries]);
            setSelectedSeries(newSeries.id.toString());
            setNewSeriesName("");
            setNewSeriesDesc("");
            setShowSeriesForm(false);
            toast.success("تمت إضافة السلسلة بنجاح");
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "فشل إضافة السلسلة");
        } finally {
            setAddingSeriesLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation
            const missingFields: string[] = [];
            if (!title.trim()) missingFields.push("العنوان");
            if (!description.trim()) missingFields.push("الوصف");
            if (!authorName.trim()) missingFields.push("اسم المؤلف");

            if (sourceType === 'file' && !bookFile && !existingFilePath) missingFields.push("ملف الكتاب");
            if ((sourceType === 'link' || sourceType === 'embed') && !sourceLink.trim()) missingFields.push("رابط المصدر");

            if (coverType === 'upload' && !coverFile && !existingCoverPath) missingFields.push("صورة الغلاف");

            if (bookType === 'part' && !selectedSeries) missingFields.push("السلسلة");

            if (missingFields.length > 0) {
                toast.error(`الحقول المطلوبة: ${missingFields.join(" • ")}`);
                setLoading(false);
                return;
            }

            // Build FormData
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('author_name', authorName);
            formData.append('source_type', sourceType);
            formData.append('cover_type', coverType);
            formData.append('type', bookType);

            if (sourceType === 'file' && bookFile) {
                formData.append('file_path', bookFile);
            } else if ((sourceType === 'link' || sourceType === 'embed') && sourceLink) {
                formData.append('source_link', sourceLink);
            }

            if (coverType === 'upload' && coverFile) {
                formData.append('cover_path', coverFile);
            }

            if (bookType === 'part' && selectedSeries) {
                formData.append('book_series_id', selectedSeries);
            }

            if (keywords.trim()) {
                const keywordsArray = keywords.split(',').map(k => k.trim()).filter(Boolean);
                keywordsArray.forEach((keyword, index) => {
                    formData.append(`keywords[${index}]`, keyword);
                });
            }

            if (mode === 'edit' && bookId) {
                await BookService.update(parseInt(bookId), formData);
                toast.success("تم تحديث الكتاب بنجاح!");
            } else {
                await BookService.create(formData);
                toast.success("تمت إضافة الكتاب بنجاح!");
            }

            onSuccess();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || `فشل ${mode === 'edit' ? 'تحديث' : 'إضافة'} الكتاب`);
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FiType className="text-primary" />
                    المعلومات الأساسية
                </h2>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">عنوان الكتاب *</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="أدخل عنوان الكتاب"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                </div>

                <div className="space-y-2 relative">
                    <label className="block text-sm font-medium text-gray-700">اسم المؤلف *</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={authorName}
                            onChange={handleAuthorChange}
                            onFocus={() => authorName && setShowAuthorDropdown(true)}
                            onBlur={() => setTimeout(() => setShowAuthorDropdown(false), 200)}
                            placeholder="أدخل أو اختر اسم المؤلف"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pl-10"
                        />
                        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                        {showAuthorDropdown && filteredAuthors.length > 0 && (
                            <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-48 overflow-y-auto admin-scrollbar">
                                {filteredAuthors.map((author, idx) => (
                                    <li
                                        key={idx}
                                        onMouseDown={() => selectAuthor(author)}
                                        className="px-3 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-gray-50 transition text-gray-700"
                                    >
                                        <span className="line-clamp-1">{author}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">الوصف *</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="أدخل وصف الكتاب أو ملخص عنه"
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">الكلمات المفتاحية</label>
                    <input
                        type="text"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        placeholder="افصل بفواصل: تاريخ، إسلام، فقه"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                </div>
            </div>

            {/* Source Type */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FiLink className="text-primary" />
                    نوع المصدر
                </h2>

                <div className="grid grid-cols-3 gap-3">
                    <button
                        type="button"
                        onClick={() => setSourceType('file')}
                        className={`px-4 py-3 rounded-lg border-2 transition-all ${sourceType === 'file'
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <FiUpload className="mx-auto mb-1" size={20} />
                        <span className="text-sm">رفع ملف</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setSourceType('link')}
                        className={`px-4 py-3 rounded-lg border-2 transition-all ${sourceType === 'link'
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <FiLink className="mx-auto mb-1" size={20} />
                        <span className="text-sm">رابط</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setSourceType('embed')}
                        className={`px-4 py-3 rounded-lg border-2 transition-all ${sourceType === 'embed'
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <FiBook className="mx-auto mb-1" size={20} />
                        <span className="text-sm">مضمن</span>
                    </button>
                </div>

                {sourceType === 'file' && (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            {mode === 'edit' ? 'ملف الكتاب (اتركه فارغاً للإبقاء على الملف الحالي)' : 'ملف الكتاب (PDF، ePub، إلخ) *'}
                        </label>
                        <input
                            type="file"
                            onChange={handleBookFileChange}
                            accept=".pdf,.epub,.mobi"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                        {bookFile ? (
                            <p className="text-sm text-green-600">ملف جديد: {bookFile.name}</p>
                        ) : existingFilePath && (
                            <p className="text-sm text-gray-600">الملف الحالي موجود</p>
                        )}
                    </div>
                )}

                {(sourceType === 'link' || sourceType === 'embed') && (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            {sourceType === 'link' ? 'رابط الكتاب *' : 'كود التضمين *'}
                        </label>
                        <input
                            type="text"
                            value={sourceLink}
                            onChange={(e) => setSourceLink(e.target.value)}
                            placeholder={sourceType === 'link' ? 'https://example.com/book.pdf' : '<iframe src="..."></iframe>'}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                    </div>
                )}
            </div>

            {/* Cover */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FiImage className="text-primary" />
                    صورة الغلاف
                </h2>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setCoverType('auto')}
                        className={`px-4 py-3 rounded-lg border-2 transition-all ${coverType === 'auto'
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        تلقائي (افتراضي)
                    </button>
                    <button
                        type="button"
                        onClick={() => setCoverType('upload')}
                        className={`px-4 py-3 rounded-lg border-2 transition-all ${coverType === 'upload'
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        رفع صورة مخصصة
                    </button>
                </div>

                {coverType === 'upload' && (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            {mode === 'edit' ? 'صورة الغلاف (اتركها فارغة للإبقاء على الصورة الحالية)' : 'صورة الغلاف'}
                        </label>
                        <input
                            type="file"
                            onChange={handleCoverChange}
                            accept="image/*"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        {coverPreview && (
                            <div className="mt-3">
                                <p className="text-sm text-gray-600 mb-2">
                                    {coverFile ? 'صورة جديدة:' : 'الصورة الحالية:'}
                                </p>
                                <img src={coverPreview} alt="Preview" className="w-32 h-48 object-cover rounded-lg border-2 border-gray-200" />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Book Type & Series */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">نوع الكتاب</h2>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setBookType('single')}
                        className={`px-4 py-3 rounded-lg border-2 transition-all ${bookType === 'single'
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        كتاب مستقل
                    </button>
                    <button
                        type="button"
                        onClick={() => setBookType('part')}
                        className={`px-4 py-3 rounded-lg border-2 transition-all ${bookType === 'part'
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        جزء من سلسلة
                    </button>
                </div>

                {bookType === 'part' && (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">اختر السلسلة *</label>
                        <div className="flex gap-2">
                            <FancySelect
                                value={selectedSeries}
                                onChange={(v) => setSelectedSeries(v)}
                                options={[{ label: "اختر سلسلة", value: "" }, ...series.map(s => ({ label: s.name, value: String(s.id) }))]}
                                placeholder="اختر سلسلة"
                                className="flex-1"
                            />
                            <button
                                type="button"
                                onClick={() => setShowSeriesForm(!showSeriesForm)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <FiPlus />
                            </button>
                        </div>

                        {showSeriesForm && (
                            <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-3">
                                <input
                                    type="text"
                                    value={newSeriesName}
                                    onChange={(e) => setNewSeriesName(e.target.value)}
                                    placeholder="اسم السلسلة الجديدة"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                                <textarea
                                    value={newSeriesDesc}
                                    onChange={(e) => setNewSeriesDesc(e.target.value)}
                                    placeholder="وصف السلسلة (اختياري)"
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddSeries}
                                    disabled={addingSeriesLoading}
                                    className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {addingSeriesLoading ? "جاري الإضافة..." : "إضافة السلسلة"}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    إلغاء
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <FiSave size={18} />
                    {loading ? (mode === 'edit' ? "جاري التحديث..." : "جاري الحفظ...") : (mode === 'edit' ? "تحديث الكتاب" : "حفظ الكتاب")}
                </button>
            </div>
        </form>
    );
}
