"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { DocumentService } from "@/app/admin/services/documentService";
import { FiSave, FiImage, FiType, FiLink, FiUpload, FiFile } from "react-icons/fi";
import { useToast } from "@/components/admin/ToastProvider";

interface DocumentFormProps {
    mode: 'create' | 'edit';
    documentId?: string;
    reportType: 'financial' | 'annual';
    onSuccess: () => void;
    onCancel: () => void;
}

export default function DocumentForm({ mode, documentId, reportType, onSuccess, onCancel }: DocumentFormProps) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(mode === 'edit');

    // Document Details
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [keywords, setKeywords] = useState("");

    // Source Fields
    const [sourceType, setSourceType] = useState<'file' | 'link'>('file');
    const [docFile, setDocFile] = useState<File | null>(null);
    const [sourceLink, setSourceLink] = useState("");
    const [existingFilePath, setExistingFilePath] = useState("");

    // Cover Fields
    const [coverType, setCoverType] = useState<'auto' | 'upload'>('auto');
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [existingCoverPath, setExistingCoverPath] = useState("");

    const getFullImageUrl = (path: string) => {
        if (!path) return null;
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
        const baseUrl = apiBase.replace('/api', '');
        return `${baseUrl}/storage/${path}`;
    };

    useEffect(() => {
        if (mode === 'edit' && documentId) {
            fetchDocumentData();
        }
    }, [mode, documentId]);

    const fetchDocumentData = async () => {
        if (!documentId) return;

        setInitialLoading(true);
        try {
            const doc = await DocumentService.getById(documentId);

            setTitle(doc.title || "");
            setDescription(doc.description || "");
            setSourceType(doc.source_type || 'file');
            setSourceLink(doc.source_link || "");
            setCoverType(doc.cover_type || 'auto');

            if (doc.keywords && Array.isArray(doc.keywords)) {
                setKeywords(doc.keywords.join(', '));
            }

            if (doc.file_path) setExistingFilePath(doc.file_path);
            if (doc.cover_path) {
                setExistingCoverPath(doc.cover_path);
                const fullCoverUrl = getFullImageUrl(doc.cover_path);
                setCoverPreview(fullCoverUrl);
            }

        } catch (err: any) {
            console.error("Error fetching document:", err);
            toast.error(err.message || "فشل تحميل بيانات الملف");
        } finally {
            setInitialLoading(false);
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setDocFile(e.target.files[0]);
        }
    };

    const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
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

            if (sourceType === 'file' && !docFile && !existingFilePath) missingFields.push("ملف التقرير");
            if (sourceType === 'link' && !sourceLink.trim()) missingFields.push("رابط المصدر");

            if (coverType === 'upload' && !coverFile && !existingCoverPath) missingFields.push("صورة الغلاف");

            if (missingFields.length > 0) {
                toast.error(`الحقول المطلوبة: ${missingFields.join(" • ")}`);
                setLoading(false);
                return;
            }

            // Build FormData
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('source_type', sourceType);
            formData.append('cover_type', coverType);

            if (sourceType === 'file' && docFile) {
                formData.append('file_path', docFile);
            } else if (sourceType === 'link' && sourceLink) {
                formData.append('source_link', sourceLink);
            }

            if (coverType === 'upload' && coverFile) {
                formData.append('cover_path', coverFile);
            }

            if (keywords.trim()) {
                const keywordsArray = keywords.split(',').map(k => k.trim()).filter(Boolean);
                keywordsArray.forEach((keyword, index) => {
                    formData.append(`keywords[${index}]`, keyword);
                });
            }

            if (mode === 'edit' && documentId) {
                formData.append('_method', 'PUT');
                await DocumentService.update(parseInt(documentId), formData);
                toast.success("تم تحديث التقرير بنجاح!");
            } else {
                await DocumentService.create(formData);
                toast.success("تمت إضافة التقرير بنجاح!");
            }

            onSuccess();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || `فشل ${mode === 'edit' ? 'تحديث' : 'إضافة'} التقرير`);
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
                    <label className="block text-sm font-medium text-gray-700">عنوان التقرير *</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="أدخل عنوان التقرير"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">الوصف *</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="أدخل وصف التقرير"
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
                        placeholder="افصل بفواصل: مالي، 2024، تقرير"
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

                <div className="grid grid-cols-2 gap-3">
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
                        <span className="text-sm">رابط خارجي</span>
                    </button>
                </div>

                {sourceType === 'file' && (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            {mode === 'edit' ? 'ملف التقرير (اتركه فارغاً للإبقاء على الملف الحالي)' : 'ملف التقرير (PDF, Word, Excel, إلخ) *'}
                        </label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                        {docFile ? (
                            <p className="text-sm text-green-600">ملف جديد: {docFile.name}</p>
                        ) : existingFilePath && (
                            <p className="text-sm text-gray-600">الملف الحالي موجود</p>
                        )}
                    </div>
                )}

                {sourceType === 'link' && (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">رابط التقرير *</label>
                        <input
                            type="url"
                            value={sourceLink}
                            onChange={(e) => setSourceLink(e.target.value)}
                            placeholder="https://example.com/report.pdf"
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
                    {loading ? (mode === 'edit' ? "جاري التحديث..." : "جاري الحفظ...") : (mode === 'edit' ? "تحديث التقرير" : "حفظ التقرير")}
                </button>
            </div>
        </form>
    );
}
