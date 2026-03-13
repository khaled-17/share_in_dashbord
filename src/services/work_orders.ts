import { api } from "./api";
import type { Customer } from "./customers";
import type { Quotation } from "./quotations";
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
  getAll: async () => {
    const res = await api.get<any>("/work-orders");
    return (res.data ? res.data : res) as WorkOrder[];
  },
  create: async (
    data: Omit<
      WorkOrder,
      "id" | "order_code" | "created_at" | "customer" | "quotation"
    >,
  ) => {
    const res = await api.post<any>("/work-orders", data);
    return (res.data ? res.data : res) as WorkOrder;
  },
  delete: async (id: number) => {
    const res = await api.delete<any>(`/work-orders/${id}`);
    return res;
  },
};
