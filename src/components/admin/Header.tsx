"use client";
import React, { useState } from "react";
import { FiMenu } from "react-icons/fi";
import { SearchCommand, SearchTrigger } from "./SearchCommand";
import NotificationDropdown from "./NotificationDropdown";

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <>
            <header className="sticky top-0 z-30 flex h-20 items-center justify-between bg-white px-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
                    >
                        <FiMenu size={24} />
                    </button>

                    {/* Smart Search Bar */}
                    <SearchTrigger onClick={() => setIsSearchOpen(true)} />
                </div>

                <div className="flex items-center gap-4">
                    {/* Notification Dropdown */}
                    <NotificationDropdown />

                    {/* User Profile */}
                    <div className="flex items-center gap-3 border-r border-gray-200 pr-4">
                        <div className="text-left hidden sm:block">
                            <p className="text-sm font-semibold text-gray-800">أدمن النظام</p>
                            <p className="text-xs text-gray-500">مشرف عام</p>
                        </div>
                        <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                            {/* Placeholder Avatar */}
                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                                <span className="text-lg font-bold">A</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Search Command Modal */}
            <SearchCommand
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />
        </>
    );
}
