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
    getSettings: () => api.get<CompanySettings>('/company'),
    updateSettings: (data: Partial<CompanySettings>) => api.put<CompanySettings>('/company', data),
};
