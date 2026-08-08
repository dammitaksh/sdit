export type DashboardMetric = {
    label: string;
    value: string;
    trend: string;
    note: string;
};

export type ActivityItem = {
    title: string;
    detail: string;
    state: "stable" | "watching" | "urgent";
};

export * from "./dashboard-state";