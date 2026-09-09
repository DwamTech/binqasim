"use client";

import React, { useState, useEffect } from "react";
import { UserService, User, UserRole, CreateUserData, UpdateUserData, ChangePasswordData } from "@/app/admin/services/userService";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiLock, FiX, FiSave, FiUser, FiMail, FiShield } from "react-icons/fi";
import { useToast } from "@/components/admin/ToastProvider";

export default function UsersManagementPage() {
    const toast = useToast();
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedRole, setSelectedRole] = useState<UserRole | "">("");

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean, id: number | null, name: string }>({
        show: false,
        id: null,
        name: ''
    });

    // Form States
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formName, setFormName] = useState("");
    const [formEmail, setFormEmail] = useState("");
    const [formPassword, setFormPassword] = useState("");
    const [formRole, setFormRole] = useState<UserRole>("user");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConf, setNewPasswordConf] = useState("");
    const [formLoading, setFormLoading] = useState(false);

    const roles: UserRole[] = ['admin', 'editor', 'author', 'reviewer', 'user'];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await UserService.getAllUsers(1, undefined, "");
            let data = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
            setAllUsers(data);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "فشل تحميل المستخدمين");
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = allUsers
        .filter(user => {
            const matchesSearch = user.name?.toLowerCase().includes(search.toLowerCase()) ||
                user.email?.toLowerCase().includes(search.toLowerCase());
            const matchesRole = !selectedRole || user.role === selectedRole;
            return matchesSearch && matchesRole;
        })
        .sort((a, b) => b.id - a.id);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedRole]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const openCreateModal = () => {
        setFormName("");
        setFormEmail("");
        setFormPassword("");
        setFormRole("user");
        setShowCreateModal(true);
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setFormName(user.name);
        setFormEmail(user.email);
        setFormRole(user.role);
        setShowEditModal(true);
    };

    const openPasswordModal = (user: User) => {
        setSelectedUser(user);
        setNewPassword("");
        setNewPasswordConf("");
        setShowPasswordModal(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            if (!formName || !formEmail || !formPassword) {
                toast.error("جميع الحقول مطلوبة");
                setFormLoading(false);
                return;
            }

            if (formPassword.length < 8) {
                toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
                setFormLoading(false);
                return;
            }

            const data: CreateUserData = {
                name: formName,
                email: formEmail,
                password: formPassword,
                role: formRole,
            };

            await UserService.createUser(data);
            toast.success("تم إنشاء الحساب بنجاح!");
            setShowCreateModal(false);
            fetchUsers();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "فشل إنشاء الحساب");
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        setFormLoading(true);

        try {
            const data: UpdateUserData = {
                name: formName,
                email: formEmail,
                role: formRole,
            };

            await UserService.updateUser(selectedUser.id, data);
            toast.success("تم تحديث المستخدم بنجاح!");
            setShowEditModal(false);
            fetchUsers();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "فشل تحديث المستخدم");
        } finally {
            setFormLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        setFormLoading(true);

        try {
            if (!newPassword || !newPasswordConf) {
                toast.error("يرجى إدخال كلمة المرور وتأكيدها");
                setFormLoading(false);
                return;
            }

            if (newPassword !== newPasswordConf) {
                toast.error("كلمة المرور غير متطابقة");
                setFormLoading(false);
                return;
            }

            if (newPassword.length < 8) {
                toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
                setFormLoading(false);
                return;
            }

            const data: ChangePasswordData = {
                new_password: newPassword,
                new_password_confirmation: newPasswordConf,
            };

            await UserService.changeUserPassword(selectedUser.id, data);
            toast.success("تم تغيير كلمة المرور بنجاح!");
            setShowPasswordModal(false);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "فشل تغيير كلمة المرور");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        setDeleteConfirm({ show: true, id, name });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.id) return;

        try {
            await UserService.deleteUser(deleteConfirm.id);
            setAllUsers(prev => prev.filter(u => u.id !== deleteConfirm.id));
            toast.success('تم حذف المستخدم بنجاح');
        } catch (err: any) {
            toast.error(err.message || 'فشل حذف المستخدم');
        } finally {
            setDeleteConfirm({ show: false, id: null, name: '' });
        }
    };

    return (
        <div className="w-full space-y-6">
            <section className="animated-hero relative overflow-hidden rounded-2xl p-6 md:p-8">
                <div className="absolute inset-0 pointer-events-none hero-grid"></div>
                <span className="hero-blob hero-blob-1"></span>
                <span className="hero-blob hero-blob-2"></span>
                <span className="hero-dot hero-dot-1"></span>
                <span className="hero-dot hero-dot-2"></span>

                <div className="relative z-10 flex items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">إدارة الحسابات</h1>
                        <p className="text-sm text-gray-700 mt-1">إدارة المستخدمين والمشرفين</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        <FiPlus size={18} />
                        <span>إضافة مستخدم</span>
                    </button>
                </div>
            </section>

            <div className="rounded-xl border border-gray-200 shadow-sm p-4 bg-gradient-to-r from-primary/50 to-secondary/10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <div className="md:col-span-8 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm flex items-center">
                        <FiSearch className="text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="بحث بالاسم أو البريد الإلكتروني..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 px-3 text-sm"
                        />
                    </div>

                    <div className="md:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as UserRole | "")}
                            className="w-full px-3 py-1.5 bg-transparent border-none outline-none text-gray-700 text-sm cursor-pointer"
                        >
                            <option value="">كل الأدوار</option>
                            {roles.map(role => (
                                <option key={role} value={role}>{UserService.getRoleLabel(role)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center">
                        <span className="text-xs text-gray-500">إجمالي</span>
                        <span className="text-lg font-bold text-primary">{filteredUsers.length}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="hidden md:block">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">المستخدم</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">البريد</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">الدور</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">تاريخ التسجيل</th>
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
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            لا توجد نتائج
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                        <FiUser className="text-gray-500" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-800">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dir-ltr text-right">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${UserService.getRoleColor(user.role)}`}>
                                                    {UserService.getRoleLabel(user.role)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(user.created_at).toLocaleDateString('ar-EG')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openPasswordModal(user)}
                                                        className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                                                        title="تغيير كلمة المرور"
                                                    >
                                                        <FiLock size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                        title="تعديل"
                                                    >
                                                        <FiEdit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.id, user.name)}
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
                </div>
                <div className="p-3 md:hidden">
                    {loading ? (
                        <div className="px-3 py-6 text-center text-gray-500">جاري التحميل...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="px-3 py-6 text-center text-gray-500">لا توجد نتائج</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {paginatedUsers.map((user) => (
                                <div key={user.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                <FiUser className="text-gray-500" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-800">{user.name}</div>
                                                <div className="text-xs text-gray-500 dir-ltr">{user.email}</div>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${UserService.getRoleColor(user.role)}`}>
                                            {UserService.getRoleLabel(user.role)}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString('ar-EG')}
                                    </div>
                                    <div className="flex items-center gap-2 mt-3">
                                        <button
                                            onClick={() => openPasswordModal(user)}
                                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                                            title="تغيير كلمة المرور"
                                        >
                                            <FiLock size={16} />
                                        </button>
                                        <button
                                            onClick={() => openEditModal(user)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                            title="تعديل"
                                        >
                                            <FiEdit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id, user.name)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                            title="حذف"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
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

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">إضافة مستخدم جديد</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                                <FiX size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم *</label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني *</label>
                                <input
                                    type="email"
                                    value={formEmail}
                                    onChange={(e) => setFormEmail(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور *</label>
                                <input
                                    type="password"
                                    value={formPassword}
                                    onChange={(e) => setFormPassword(e.target.value)}
                                    placeholder="8 أحرف على الأقل"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الدور *</label>
                                <select
                                    value={formRole}
                                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    {roles.map(role => (
                                        <option key={role} value={role}>{UserService.getRoleLabel(role)}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={formLoading}
                                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <FiSave size={18} />
                                {formLoading ? "جاري الإنشاء..." : "إنشاء الحساب"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal - Similar structure */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">تعديل المستخدم</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                                <FiX size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم</label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                                <input
                                    type="email"
                                    value={formEmail}
                                    onChange={(e) => setFormEmail(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الدور</label>
                                <select
                                    value={formRole}
                                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    {roles.map(role => (
                                        <option key={role} value={role}>{UserService.getRoleLabel(role)}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={formLoading}
                                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <FiSave size={18} />
                                {formLoading ? "جاري التحديث..." : "حفظ التعديلات"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Password Modal */}
            {showPasswordModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">تغيير كلمة المرور</h3>
                            <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600">
                                <FiX size={24} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">تغيير كلمة مرور: <strong>{selectedUser.name}</strong></p>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الجديدة *</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="8 أحرف على الأقل"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">تأكيد كلمة المرور *</label>
                                <input
                                    type="password"
                                    value={newPasswordConf}
                                    onChange={(e) => setNewPasswordConf(e.target.value)}
                                    placeholder="أعد إدخال كلمة المرور"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={formLoading}
                                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <FiLock size={18} />
                                {formLoading ? "جاري التحديث..." : "تغيير كلمة المرور"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
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
                            <p className="text-gray-700">هل أنت متأكد من حذف المستخدم:</p>
                            <p className="font-semibold text-gray-900 mt-2 p-3 bg-gray-50 rounded-lg">
                                "{deleteConfirm.name}"
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm({ show: false, id: null, name: '' })}
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
