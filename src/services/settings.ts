import { api } from './api';

export interface ExpenseType {
    id: number;
    exptype_id: string;
    exptype_name: string;
    category?: string | null;
}

export interface RevenueType {
    id: number;
    revtype_id: string;
    revtype_name: string;
    paymethod: string;
}

export interface ProjectType {
    id: number;
    type_id: string;
    type_name: string;
}

export const settingsService = {
    // Expense Types
    getExpenseTypes: () => api.get<ExpenseType[]>('/settings/expense-types'),
    createExpenseType: (data: Omit<ExpenseType, 'id'>) => api.post<ExpenseType>('/settings/expense-types', data),
    updateExpenseType: (id: number, data: Partial<ExpenseType>) => api.put<ExpenseType>(`/settings/expense-types/${id}`, data),
    deleteExpenseType: (id: number) => api.delete<{ message: string }>(`/settings/expense-types/${id}`),

    // Revenue Types
    getRevenueTypes: () => api.get<RevenueType[]>('/settings/revenue-types'),
    createRevenueType: (data: Omit<RevenueType, 'id'>) => api.post<RevenueType>('/settings/revenue-types', data),
    updateRevenueType: (id: number, data: Partial<RevenueType>) => api.put<RevenueType>(`/settings/revenue-types/${id}`, data),
    deleteRevenueType: (id: number) => api.delete<{ message: string }>(`/settings/revenue-types/${id}`),

    // Project Types
    getProjectTypes: () => api.get<ProjectType[]>('/settings/project-types'),
    createProjectType: (data: Omit<ProjectType, 'id'>) => api.post<ProjectType>('/settings/project-types', data),
    updateProjectType: (id: number, data: Partial<ProjectType>) => api.put<ProjectType>(`/settings/project-types/${id}`, data),
    deleteProjectType: (id: number) => api.delete<{ message: string }>(`/settings/project-types/${id}`),
};
