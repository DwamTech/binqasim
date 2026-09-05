"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { FiFileText, FiArrowRight } from "react-icons/fi";
import DocumentForm from "@/components/admin/DocumentForm";

export default function EditAnnualReportPage() {
    const router = useRouter();
    const params = useParams();
    const documentId = params.id as string;

    const handleSuccess = () => {
        router.push("/admin/governance/annual-reports");
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <section className="animated-hero relative overflow-hidden rounded-2xl p-6 md:p-8">
                <div className="absolute inset-0 pointer-events-none hero-grid"></div>
                <span className="hero-blob hero-blob-1"></span>
                <span className="hero-blob hero-blob-2"></span>
                <span className="hero-dot hero-dot-1"></span>
                <span className="hero-dot hero-dot-2"></span>

                <div className="relative z-10 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-white/70 backdrop-blur-md flex items-center justify-center shadow-sm">
                            <FiFileText className="text-primary" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">تعديل تقرير سنوي</h1>
                            <p className="text-sm text-gray-700 mt-1">تحديث بيانات التقرير</p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/admin/governance/annual-reports')}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white/70 hover:bg-white rounded-lg transition-colors backdrop-blur-md shadow-sm"
                    >
                        <FiArrowRight size={18} />
                        <span>الرجوع للقائمة</span>
                    </button>
                </div>
            </section>

            {/* Document Form */}
            <DocumentForm
                mode="edit"
                documentId={documentId}
                reportType="annual"
                onSuccess={handleSuccess}
                onCancel={handleCancel}
            />
        </div>
    );
}
