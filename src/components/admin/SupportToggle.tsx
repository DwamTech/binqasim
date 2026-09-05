import React, { useState, useEffect } from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import { DashboardService } from '@/app/admin/services/dashboardService';

export default function SupportToggle() {
    const [supportEnabled, setSupportEnabled] = useState(true);
    const [updatingSettings, setUpdatingSettings] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const settingsData = await DashboardService.getSupportSettings();
            if (settingsData) {
                setSupportEnabled(Boolean(settingsData.individual_support_enabled));
            }
        } catch (error) {
            console.error("Failed to fetch support settings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSupportToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.checked;
        setUpdatingSettings(true);
        setSupportEnabled(newValue);

        try {
            await DashboardService.updateAllSupportSettings(newValue);
        } catch (error) {
            console.error("Failed to update support settings", error);
            setSupportEnabled(!newValue);
            alert("فشل تحديث الإعدادات. يرجى المحاولة مرة أخرى.");
        } finally {
            setUpdatingSettings(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 min-w-max">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span className="text-sm text-gray-500">جاري التحميل...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 min-w-max transition-all hover:shadow-md">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <FiCheckCircle className="text-lg" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800">استقبال الطلبات</span>
                        <span className="text-[10px] text-gray-400">أفراد / مؤسسات</span>
                    </div>
                </div>

                <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>

                <label className="relative inline-flex items-center cursor-pointer group">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={supportEnabled}
                        onChange={handleSupportToggle}
                        disabled={updatingSettings}
                    />
                    <div className={`w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer transition-colors duration-300 ease-in-out
                    ${supportEnabled ? "peer-checked:bg-primary" : "peer-checked:bg-gray-200"}
                    after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300
                    peer-checked:after:translate-x-full peer-checked:after:border-white group-hover:after:scale-110
                    peer-disabled:opacity-70 peer-disabled:cursor-not-allowed
                `}></div>

                    {updatingSettings && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        </div>
                    )}
                </label>
                <span className={`text-sm font-bold transition-colors ${supportEnabled ? "text-primary" : "text-gray-400"}`}>
                    {supportEnabled ? "مفعل" : "معطل"}
                </span>
            </div>
        </div>
    );
}
