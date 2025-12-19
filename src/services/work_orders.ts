import { api } from './api';
import type { Customer } from './customers';
import type { Quotation } from './quotations';

export interface WorkOrder {
    id: number;
    order_code: string;
    quotation_id: number;
    customer_id: string;
    created_at?: string;
    customer?: Customer;
    quotation?: Quotation;
}

export const workOrderService = {
    getAll: () => api.get<WorkOrder[]>('/work-orders'),
    create: (data: Partial<WorkOrder>) => api.post<WorkOrder>('/work-orders', data),
    delete: (id: number) => api.delete<{ message: string }>(`/work-orders/${id}`),
};
