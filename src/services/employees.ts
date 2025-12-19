import { api } from './api';

export interface Employee {
    id: number;
    emp_code: string;
    name: string;
    phone?: string | null;
    position?: string | null;
    salary?: number | null;
    start_date?: string | null;
}

export const employeeService = {
    getAll: () => api.get<Employee[]>('/employees'),

    create: (data: Omit<Employee, 'id'>) => api.post<Employee>('/employees', data),

    update: (id: number, data: Partial<Employee>) => api.put<Employee>(`/employees/${id}`, data),

    delete: (id: number) => api.delete<{ message: string }>(`/employees/${id}`),
};
