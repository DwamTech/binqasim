"use client";

import React, { useState } from 'react';
import { FiDownload, FiCalendar, FiFileText } from 'react-icons/fi';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { useToast } from "@/components/admin/ToastProvider";

interface DataExportPanelProps {
    onFetchData: (startDate: string, endDate: string) => Promise<any[]>;
    fieldMapping: { [key: string]: string };
    title: string;
    fileName: string;
}

export default function DataExportPanel({ onFetchData, fieldMapping, title, fileName }: DataExportPanelProps) {
    const toast = useToast();
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(false);

    const prepareData = (data: any[]) => {
        return data.map(item => {
            const row: any = {};
            Object.keys(fieldMapping).forEach(key => {
                let value = item[key];
                // Handle boolean or special formatting
                if (value === true) value = "نعم";
                if (value === false) value = "لا";
                if (value === null || value === undefined) value = "-";
                // Basic Date Check
                if ((key.includes('date') || key.includes('_at')) && value !== "-") {
                    try {
                        const d = new Date(value);
                        if (!isNaN(d.getTime())) value = d.toLocaleDateString('ar-EG');
                    } catch (e) { }
                }
                row[fieldMapping[key]] = value;
            });
            return row;
        });
    };

    const handleExport = async (type: 'excel' | 'pdf') => {
        if (!startDate || !endDate) {
            toast.error("يرجى تحديد نطاق التاريخ أولاً");
            return;
        }

        setLoading(true);
        try {
            const rawData = await onFetchData(startDate, endDate);

            if (!rawData || rawData.length === 0) {
                toast.error("لا توجد بيانات في هذا النطاق");
                setLoading(false);
                return;
            }

            const formattedData = prepareData(rawData);

            if (type === 'excel') {
                const ws = XLSX.utils.json_to_sheet(formattedData);
                // Right to left
                if (!ws['!views']) ws['!views'] = [];
                ws['!views'].push({ rightToLeft: true });

                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Report");

                const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
                saveAs(blob, `${fileName}_${startDate}_${endDate}.xlsx`);
                toast.success("تم تصدير Excel بنجاح");
            } else {
                // PDF Strategy: New Window Print for full Arabic Support
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    const headers = Object.values(fieldMapping);
                    const rows = formattedData.map(obj => Object.values(obj));

                    const htmlContent = `
                        <!DOCTYPE html>
                        <html dir="rtl" lang="ar">
                        <head>
                            <title>${title}</title>
                            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
                            <style>
                                body { font-family: 'Cairo', sans-serif; padding: 20px; direction: rtl; }
                                h1 { text-align: center; color: #333; margin-bottom: 5px; font-size: 24px; }
                                .meta { text-align: center; color: #666; margin-bottom: 20px; font-size: 14px; }
                                table { width: 100%; border-collapse: collapse; font-size: 11px; }
                                th, td { border: 1px solid #ddd; padding: 5px; text-align: right; vertical-align: top; }
                                th { background-color: #f4f4f4; font-weight: bold; white-space: nowrap; color: #333; }
                                tr:nth-child(even) { background-color: #f9f9f9; }
                                @media print {
                                    @page { size: landscape; margin: 10mm; }
                                    body { padding: 0; -webkit-print-color-adjust: exact; }
                                }
                            </style>
                        </head>
                        <body>
                            <h1>${title}</h1>
                            <div class="meta">
                                الفترة من: <b>${startDate}</b> إلى: <b>${endDate}</b> &nbsp;|&nbsp; 
                                تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG')}
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        ${headers.map(h => `<th>${h}</th>`).join('')}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rows.map(row => `
                                        <tr>
                                            ${row.map(cell => `<td>${cell || '-'}</td>`).join('')}
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                            <script>
                                // Auto print after loaded
                                window.onload = function() { 
                                    setTimeout(() => {
                                        window.print();
                                        window.focus();
                                    }, 500);
                                }
                            </script>
                        </body>
                        </html>
                    `;

                    printWindow.document.write(htmlContent);
                    printWindow.document.close();
                } else {
                    toast.error("يرجى السماح بالنوافذ المنبثقة للطباعة");
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("حدث خطأ أثناء التصدير");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4 mb-6">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <FiFileText />
                تصدير التقارير
            </h3>
            <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[150px]">
                    <label className="block text-sm text-gray-600 mb-1">من تاريخ</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                </div>
                <div className="flex-1 min-w-[150px]">
                    <label className="block text-sm text-gray-600 mb-1">إلى تاريخ</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => handleExport('excel')}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
                    >
                        {loading ? <span className="animate-spin">⌛</span> : <FaFileExcel />}
                        Excel
                    </button>

                </div>
            </div>
        </div>
    );
}
