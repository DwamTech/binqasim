"use client";
import React, { useState, useEffect, useCallback } from "react";
import { ContentService } from "@/app/admin/services/contentService";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { FiSave, FiLoader } from "react-icons/fi";
import { useToast } from "@/components/admin/ToastProvider";

interface ContentEditorPageProps {
    pageTitle: string;
    contentKey: string;
    description?: string;
    hideHeader?: boolean;
    saveRef?: React.MutableRefObject<(() => Promise<void>) | null>;
}

export default function ContentEditorPage({ pageTitle, contentKey, description, hideHeader, saveRef }: ContentEditorPageProps) {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const toast = useToast();

    useEffect(() => {
        fetchContent();
    }, [contentKey]);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const data = await ContentService.get(contentKey);
            setContent(data);
        } catch (error) {
            console.error(error);
            toast.error("فشل تحميل المحتوى");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = useCallback(async () => {
        setSaving(true);
        try {
            await ContentService.update(contentKey, content);
            toast.success("تم حفظ المحتوى بنجاح");
        } catch (error) {
            console.error(error);
            toast.error("فشل حفظ التعديلات");
        } finally {
            setSaving(false);
        }
    }, [contentKey, content, toast]);

    useEffect(() => {
        if (saveRef) {
            saveRef.current = handleSave;
        }
    }, [saveRef, handleSave]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">جاري تحميل المحتوى...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {!hideHeader && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{pageTitle}</h1>
                        {description && <p className="text-gray-500 mt-1">{description}</p>}
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-70 font-medium"
                    >
                        {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
                        {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
                    </button>
                </div>
            )}

            <RichTextEditor value={content} onChange={setContent} />
        </div>
    );
}
