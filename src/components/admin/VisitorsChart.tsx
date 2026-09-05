import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AnalyticsDataPoint } from '../../app/admin/models/dashboard';

interface VisitorsChartProps {
    data: AnalyticsDataPoint[];
}

export default function VisitorsChart({ data }: VisitorsChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-gray-100 bg-gray-50">
                <p className="text-gray-400">لا توجد بيانات متاحة للعرض</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        tickFormatter={(value) => {
                            // Format date to show just day/month if needed, or keeping it strictly as API
                            return new Date(value).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' });
                        }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ color: '#374151', marginBottom: '4px' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="visits"
                        stroke="#8884d8"
                        fillOpacity={1}
                        fill="url(#colorVisits)"
                        name="الزيارات"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
