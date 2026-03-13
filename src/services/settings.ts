import { api } from "./api";
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
  getExpenseTypes: async () => {
    const res = await api.get<any>("/settings/expense-types");
    return (res.data ? res.data : res) as ExpenseType[];
  },
  createExpenseType: async (data: Omit<ExpenseType, "id" | "exptype_id">) => {
    const res = await api.post<any>("/settings/expense-types", data);
    return (res.data ? res.data : res) as ExpenseType;
  },
  updateExpenseType: async (id: number, data: Partial<ExpenseType>) => {
    const res = await api.put<any>(`/settings/expense-types/${id}`, data);
    return (res.data ? res.data : res) as ExpenseType;
  },
  deleteExpenseType: async (id: number) => {
    const res = await api.delete<any>(`/settings/expense-types/${id}`);
    return res.data ? res.data : res;
  },
  // Revenue Types
  getRevenueTypes: async () => {
    const res = await api.get<any>("/settings/revenue-types");
    return (res.data ? res.data : res) as RevenueType[];
  },
  createRevenueType: async (data: Omit<RevenueType, "id" | "revtype_id">) => {
    const res = await api.post<any>("/settings/revenue-types", data);
    return (res.data ? res.data : res) as RevenueType;
  },
  updateRevenueType: async (id: number, data: Partial<RevenueType>) => {
    const res = await api.put<any>(`/settings/revenue-types/${id}`, data);
    return (res.data ? res.data : res) as RevenueType;
  },
  deleteRevenueType: async (id: number) => {
    const res = await api.delete<any>(`/settings/revenue-types/${id}`);
    return res.data ? res.data : res;
  },
  // Project Types
  getProjectTypes: async () => {
    const res = await api.get<any>("/settings/project-types");
    return (res.data ? res.data : res) as ProjectType[];
  },
  createProjectType: async (data: Omit<ProjectType, "id" | "type_id">) => {
    const res = await api.post<any>("/settings/project-types", data);
    return (res.data ? res.data : res) as ProjectType;
  },
  updateProjectType: async (id: number, data: Partial<ProjectType>) => {
    const res = await api.put<any>(`/settings/project-types/${id}`, data);
    return (res.data ? res.data : res) as ProjectType;
  },
  deleteProjectType: async (id: number) => {
    const res = await api.delete<any>(`/settings/project-types/${id}`);
    return res.data ? res.data : res;
  },
};
