export interface DashboardSummary {
    total_articles: number;
    total_users: number;
    daily_visits: number;
    pending_support_requests: number;
    total_books: number;
    trends: {
        articles: string;
        users: string;
        visits: string;
    };
}

export interface AnalyticsDataPoint {
    date: string;
    visits: number;
    requests: number;
}

export interface SupportRequest {
    id: number;
    type: "individual" | "institution";
    applicant_name: string;
    status: "pending" | "approved" | "rejected";
    created_at: string;
    avatar_url?: string;
}

export interface ApiResponse<T> {
    status: string;
    data: T;
}
