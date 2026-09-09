import React from 'react';
import { RequestStatus, getStatusLabel, getStatusColor } from '@/app/admin/services/supportService';

interface StatusBadgeProps {
    status: RequestStatus;
    className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)} ${className}`}>
            {getStatusLabel(status)}
        </span>
    );
}
