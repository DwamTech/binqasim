"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DashboardService } from '@/app/admin/services/dashboardService';

interface PendingCountsData {
    individual: {
        pending: number;
        review: number;
        total_action_needed: number;
    };
    institutional: {
        pending: number;
        review: number;
        total_action_needed: number;
    };
    total_pending: number;
    total_review: number;
}

interface PendingCountsContextType {
    counts: PendingCountsData | null;
    loading: boolean;
    refresh: () => void;
}

const PendingCountsContext = createContext<PendingCountsContextType | undefined>(undefined);

export function PendingCountsProvider({ children }: { children: ReactNode }) {
    const [counts, setCounts] = useState<PendingCountsData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchCounts = async () => {
        try {
            const data = await DashboardService.getPendingRequestsValues();
            setCounts(data);
        } catch (error) {
            console.error("Failed to fetch pending counts", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCounts();

        // Refresh every 30 seconds
        const interval = setInterval(fetchCounts, 30000);

        return () => clearInterval(interval);
    }, []);

    const refresh = () => {
        fetchCounts();
    };

    return (
        <PendingCountsContext.Provider value={{ counts, loading, refresh }}>
            {children}
        </PendingCountsContext.Provider>
    );
}

export function usePendingCounts() {
    const context = useContext(PendingCountsContext);
    if (context === undefined) {
        throw new Error('usePendingCounts must be used within a PendingCountsProvider');
    }
    return context;
}
