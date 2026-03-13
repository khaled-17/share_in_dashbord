import { api } from './api';
export interface CompanySettings {
    id: number;
    name: string;
    description?: string | null;
    about?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    updated_at: string;
}
export const companyService = {
    getSettings: async () => {
        const res = await api.get<any>('/company');
        return (res.data ? res.data : res) as CompanySettings;
    },
    updateSettings: async (data: Partial<CompanySettings>) => {
        const res = await api.put<any>('/company', data);
        return (res.data ? res.data : res) as CompanySettings;
    },
};
