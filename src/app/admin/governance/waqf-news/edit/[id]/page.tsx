"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArticleService } from "@/app/admin/services/articleService";
import { SectionService } from "@/app/admin/services/sectionService";
import { FiSave, FiImage, FiUser, FiCalendar, FiTag, FiLayers, FiFileText, FiArrowRight } from "react-icons/fi";
import { useToast } from "@/components/admin/ToastProvider";
import RichTextEditor from "@/components/admin/RichTextEditor";

export default function EditWaqfNewsPage() {
    const router = useRouter();
    const params = useParams();
    const articleId = params.id as string;
    const toast = useToast();

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form States
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [content, setContent] = useState("");
    const [authorName, setAuthorName] = useState("");
    const [status, setStatus] = useState<"draft" | "published">("published");
    const [sectionId, setSectionId] = useState<number | "">("");
    const [excerpt, setExcerpt] = useState("");
    const [gregorianDate, setGregorianDate] = useState("");
    const [keywords, setKeywords] = useState("");
    const [featuredImage, setFeaturedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const [isSlugTouched, setIsSlugTouched] = useState(false);

    // Author Logic
    const [authors, setAuthors] = useState<string[]>([]);
    const [filteredAuthors, setFilteredAuthors] = useState<string[]>([]);
    const [showAuthorsDropdown, setShowAuthorsDropdown] = useState(false);

    useEffect(() => {
        fetchAuthors();
        fetchArticleData();
    }, []);

    const fetchArticleData = async () => {
        setInitialLoading(true);
        try {
            const response = await ArticleService.getById(articleId);
            const article = response.data || response;

            // Populate form fields
            setTitle(article.title || "");
            setSlug(article.slug || "");
            setContent(article.content || "");
            setAuthorName(article.author_name || "");
            setStatus(article.status || "published");
            setSectionId(article.section_id || "");
            setExcerpt(article.excerpt || "");
            setGregorianDate(article.gregorian_date || "");
            setKeywords(article.keywords || "");

            if (article.featured_image) {
                setExistingImageUrl(article.featured_image);
                setImagePreview(article.featured_image);
            }

        } catch (err: any) {
            console.error("Error fetching news:", err);
            setError(err.message || "فشل تحميل بيانات الخبر");
        } finally {
            setInitialLoading(false);
        }
    };

    const fetchAuthors = async () => {
        try {
            const data = await ArticleService.getAuthors();
            setAuthors(data);
            setFilteredAuthors(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAuthorName(value);
        setShowAuthorsDropdown(true);

        const filtered = authors.filter(author =>
            author.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredAuthors(filtered);
    };

    const handleAuthorSelect = (author: string) => {
        setAuthorName(author);
        setShowAuthorsDropdown(false);
    };

    const slugify = (text: string) => {
        return text
            .toString()
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\p{L}\p{N}\-_]+/gu, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    };

    const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setTitle(val);
        if (!isSlugTouched) {
            setSlug(slugify(val));
        }
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFeaturedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Smart Date Logic
    const getTodayDate = () => new Date().toISOString().split('T')[0];

    const isFutureDate = (date: string) => {
        if (!date) return false;
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        return selectedDate > today;
    };

    useEffect(() => {
        if (status === 'published' && (!gregorianDate || isFutureDate(gregorianDate))) {
            setGregorianDate(getTodayDate());
        }
    }, [status]);

    const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        setGregorianDate(newDate);

        if (status === 'published' && isFutureDate(newDate)) {
            setStatus('draft');
            toast.warning('تم تحويل الخبر إلى مسودة تلقائياً لأن التاريخ مستقبلي');
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (!title || !slug || !content || !authorName || !sectionId) {
            setError("يرجى ملء جميع الحقول المطلوبة");
            setLoading(false);
            window.scrollTo(0, 0);
            return;
        }

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("slug", slug);
            formData.append("content", content);
            formData.append("author_name", authorName);
            formData.append("status", status);
            formData.append("_method", "PUT");

            if (sectionId) formData.append("section_id", String(sectionId));
            if (featuredImage) formData.append("featured_image", featuredImage);
            if (excerpt) formData.append("excerpt", excerpt);
            if (gregorianDate) formData.append("gregorian_date", gregorianDate);
            if (keywords) formData.append("keywords", keywords);

            await ArticleService.update(Number(articleId), formData);
            setSuccess("تم تحديث الخبر بنجاح!");
            toast.success("تم التحديث بنجاح");

            setTimeout(() => {
                router.push("/admin/governance/waqf-news");
            }, 1000);

        } catch (err: any) {
            setError(err.message || "حدث خطأ أثناء التحديث");
            window.scrollTo(0, 0);
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 pb-20">
            <section className="animated-hero relative overflow-hidden rounded-2xl p-6 md:p-8">
                <div className="absolute inset-0 pointer-events-none hero-grid"></div>
                <span className="hero-blob hero-blob-1"></span>
                <span className="hero-blob hero-blob-2"></span>
                <span className="hero-dot hero-dot-1"></span>
                <span className="hero-dot hero-dot-2"></span>

                <div className="relative z-10 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-white rounded-lg transition-colors backdrop-blur-md bg-white/60 shadow-sm"
                        >
                            <FiArrowRight size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">تعديل الخبر</h1>
                            <p className="text-sm text-gray-700 mt-1">تعديل ونشر أخبار الوقف</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium shadow-sm"
                        >
                            <FiSave size={18} />
                            {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
                        </button>
                    </div>
                </div>
            </section>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <span className="font-bold">خطأ:</span> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Content Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-5">
                        <div className="flex items-center gap-2 text-gray-800 font-semibold border-b pb-3 mb-2 text-lg">
                            <FiFileText className="text-primary" />
                            محتوى الخبر
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">عنوان الخبر <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={title}
                                onChange={handleTitleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">الرابط الدائم (Slug) <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => { setSlug(e.target.value); setIsSlugTouched(true); }}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                                dir="ltr"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">محتوى الخبر بالكامل <span className="text-red-500">*</span></label>
                            <RichTextEditor value={content} onChange={setContent} />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">خلاصة الخبر (تبسيط)</label>
                            <textarea
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Settings Side Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-5">
                        <div className="flex items-center gap-2 text-gray-800 font-semibold border-b pb-3 mb-2">
                            <FiLayers className="text-primary" size={20} />
                            إعدادات الخبر
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">حالة النشر</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as any)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                                >
                                    <option value="published">منشور</option>
                                    <option value="draft">مسودة</option>
                                </select>
                            </div>

                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-blue-900">القسم:</span>
                                    <span className="font-bold text-blue-700">أخبار الوقف</span>
                                </div>
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الكاتب <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <FiUser className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={authorName}
                                        onChange={handleAuthorChange}
                                        onFocus={() => setShowAuthorsDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowAuthorsDropdown(false), 200)}
                                        className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg outline-none"
                                        required
                                        autoComplete="off"
                                    />
                                </div>
                                {showAuthorsDropdown && filteredAuthors.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-xl max-h-40 overflow-auto">
                                        {filteredAuthors.map((a, i) => (
                                            <div
                                                key={i}
                                                onMouseDown={() => handleAuthorSelect(a)}
                                                className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                                            >
                                                {a}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ النشر</label>
                                <div className="relative">
                                    <FiCalendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="date"
                                        value={gregorianDate}
                                        onChange={handleDateChange}
                                        className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الكلمات المفتاحية</label>
                                <div className="relative">
                                    <FiTag className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={keywords}
                                        onChange={(e) => setKeywords(e.target.value)}
                                        placeholder="اخبار, وقف, جديد"
                                        className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-800 font-semibold border-b pb-3 mb-4">
                            <FiImage className="text-primary" size={20} />
                            الصورة البارزة
                        </div>

                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-2 text-center hover:border-primary/50 transition-all cursor-pointer relative group aspect-video overflow-hidden">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                            />
                            {imagePreview ? (
                                <img src={imagePreview} className="w-full h-full object-cover rounded-lg" alt="Preview" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
                                    <FiImage size={40} className="mb-2" />
                                    <span className="text-sm">اختر صورة للخبر</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-medium">
                                تغيير الصورة
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
