"use client";

import React, { useState, useEffect } from "react";
import { UserService, User, ProfileUpdateData } from "@/app/admin/services/userService";
import { FiUser, FiMail, FiLock, FiSave, FiShield } from "react-icons/fi";
import { useToast } from "@/components/admin/ToastProvider";

export default function ProfilePage() {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    // Form States
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");

    // Tab State
    const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setInitialLoading(true);
        try {
            const profile = await UserService.getProfile();
            setUser(profile);
            setName(profile.name);
            setEmail(profile.email);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "فشل تحميل الملف الشخصي");
        } finally {
            setInitialLoading(false);
        }
    };

    const handleUpdateInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data: ProfileUpdateData = {
                name,
                email,
            };

            await UserService.updateProfile(data);
            toast.success("تم تحديث المعلومات بنجاح!");
            fetchProfile();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "فشل تحديث المعلومات");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!currentPassword) {
                toast.error("يرجى إدخال كلمة المرور الحالية");
                setLoading(false);
                return;
            }

            if (!newPassword || !newPasswordConfirmation) {
                toast.error("يرجى إدخال كلمة المرور الجديدة وتأكيدها");
                setLoading(false);
                return;
            }

            if (newPassword !== newPasswordConfirmation) {
                toast.error("كلمة المرور الجديدة غير متطابقة");
                setLoading(false);
                return;
            }

            if (newPassword.length < 8) {
                toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
                setLoading(false);
                return;
            }

            const data: ProfileUpdateData = {
                current_password: currentPassword,
                new_password: newPassword,
                new_password_confirmation: newPasswordConfirmation,
            };

            await UserService.updateProfile(data);
            toast.success("تم تغيير كلمة المرور بنجاح!");

            // Clear password fields
            setCurrentPassword("");
            setNewPassword("");
            setNewPasswordConfirmation("");
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "فشل تغيير كلمة المرور");
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
        <div className="w-full space-y-6">
            <section className="animated-hero relative overflow-hidden rounded-2xl p-6 md:p-8">
                <div className="absolute inset-0 pointer-events-none hero-grid"></div>
                <span className="hero-blob hero-blob-1"></span>
                <span className="hero-blob hero-blob-2"></span>
                <span className="hero-dot hero-dot-1"></span>
                <span className="hero-dot hero-dot-2"></span>

                <div className="relative z-10 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-white/70 backdrop-blur-md flex items-center justify-center shadow-sm">
                            <FiUser className="text-primary" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">إدارة حسابك</h1>
                            <p className="text-sm text-gray-700 mt-1">تحديث معلوماتك الشخصية وكلمة المرور</p>
                        </div>
                    </div>
                </div>
            </section>

            {user && (
                <div className="rounded-xl bg-white/70 backdrop-blur-md p-4 shadow-sm flex items-center gap-3">
                    <span className="text-sm text-gray-700">الدور:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${UserService.getRoleColor(user.role)}`}>
                        {UserService.getRoleLabel(user.role)}
                    </span>
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'info'
                                ? 'bg-primary text-white'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <FiUser className="inline-block ml-2" />
                        المعلومات الأساسية
                    </button>
                    <button
                        onClick={() => setActiveTab('password')}
                        className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'password'
                                ? 'bg-primary text-white'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <FiLock className="inline-block ml-2" />
                        تغيير كلمة المرور
                    </button>
                </div>

                <div className="p-6">
                    {/* Basic Info Tab */}
                    {activeTab === 'info' && (
                        <form onSubmit={handleUpdateInfo} className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    الاسم الكامل *
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="أدخل اسمك الكامل"
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        required
                                    />
                                    <FiUser className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    البريد الإلكتروني *
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your.email@example.com"
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        required
                                    />
                                    <FiMail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <FiSave size={18} />
                                    {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Password Tab */}
                    {activeTab === 'password' && (
                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <p className="text-sm text-blue-800">
                                    <FiShield className="inline-block ml-2" />
                                    يجب إدخال كلمة المرور الحالية لتأكيد التغيير
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    كلمة المرور الحالية *
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="أدخل كلمة المرور الحالية"
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                    <FiLock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    كلمة المرور الجديدة *
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="8 أحرف على الأقل"
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                    <FiLock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    تأكيد كلمة المرور الجديدة *
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={newPasswordConfirmation}
                                        onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                                        placeholder="أعد إدخال كلمة المرور الجديدة"
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                    <FiLock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <FiLock size={18} />
                                    {loading ? "جاري التحديث..." : "تغيير كلمة المرور"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
