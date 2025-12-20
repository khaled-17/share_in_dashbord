import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://localhost:3001/api';

export const handlers = [
    // Customers
    http.get(`${API_BASE_URL}/customers`, () => {
        return HttpResponse.json([
            { id: 1, customer_id: 'CUST001', name: 'Test Customer', contact_person: 'John Doe', phone: '0123456789' }
        ]);
    }),
    http.post(`${API_BASE_URL}/customers`, async ({ request }) => {
        const data = await request.json() as any;
        return HttpResponse.json({ ...data, id: Math.floor(Math.random() * 1000) }, { status: 201 });
    }),
    http.put(`${API_BASE_URL}/customers/:id`, async ({ request, params }) => {
        const data = await request.json() as any;
        return HttpResponse.json({ ...data, id: Number(params.id) });
    }),
    http.delete(`${API_BASE_URL}/customers/:id`, () => {
        return HttpResponse.json({ message: 'Deleted successfully' });
    }),

    // Suppliers
    http.get(`${API_BASE_URL}/suppliers`, () => {
        return HttpResponse.json([
            { id: 1, supplier_id: 'SUP001', name: 'Test Supplier', contact_person: 'Supplier Joe', phone: '0111222333' }
        ]);
    }),
    http.post(`${API_BASE_URL}/suppliers`, async ({ request }) => {
        const data = await request.json() as any;
        return HttpResponse.json({ ...data, id: Math.floor(Math.random() * 1000) }, { status: 201 });
    }),
    http.put(`${API_BASE_URL}/suppliers/:id`, async ({ request, params }) => {
        const data = await request.json() as any;
        return HttpResponse.json({ ...data, id: Number(params.id) });
    }),
    http.delete(`${API_BASE_URL}/suppliers/:id`, () => {
        return HttpResponse.json({ message: 'Deleted successfully' });
    }),

    // Employees
    http.get(`${API_BASE_URL}/employees`, () => {
        return HttpResponse.json([
            { id: 1, emp_code: 'EMP001', name: 'Employee One', position: 'Manager', salary: 5000 }
        ]);
    }),
    http.post(`${API_BASE_URL}/employees`, async ({ request }) => {
        const data = await request.json() as any;
        return HttpResponse.json({ ...data, id: Math.floor(Math.random() * 1000) }, { status: 201 });
    }),
    http.put(`${API_BASE_URL}/employees/:id`, async ({ request, params }) => {
        const data = await request.json() as any;
        return HttpResponse.json({ ...data, id: Number(params.id) });
    }),
    http.delete(`${API_BASE_URL}/employees/:id`, () => {
        return HttpResponse.json({ message: 'Deleted successfully' });
    }),

    // Quotations
    http.get(`${API_BASE_URL}/quotations`, () => {
        return HttpResponse.json([
            { id: 1, customer_id: 'CUST001', customer: { name: 'Test Customer' }, project_name: 'Test Project', project_type_id: 'PRJ001', project_type: { type_name: 'ديجيتال ماركتنج' }, totalamount: 1000, status: 'مسودة', quote_date: '2025-01-01' }
        ]);
    }),
    http.post(`${API_BASE_URL}/quotations`, async ({ request }) => {
        const data = await request.json() as any;
        return HttpResponse.json({ ...data, id: Math.floor(Math.random() * 1000) }, { status: 201 });
    }),
    http.put(`${API_BASE_URL}/quotations/:id`, async ({ request, params }) => {
        const data = await request.json() as any;
        return HttpResponse.json({ ...data, id: Number(params.id) });
    }),
    http.get(`${API_BASE_URL}/quotations/:id`, ({ params }) => {
        return HttpResponse.json({
            id: Number(params.id),
            customer_id: 'CUST001',
            customer: { name: 'Test Customer' },
            project_type_id: 'PRJ001',
            project_type: { type_name: 'ديجيتال ماركتنج' },
            project_name: 'Test Project',
            totalamount: 1000,
            status: 'مسودة',
            items: [{ description: 'Item 1', unit_price: 100, quantity: 10, total: 1000 }]
        });
    }),
    http.delete(`${API_BASE_URL}/quotations/:id`, () => {
        return HttpResponse.json({ message: 'Deleted successfully' });
    }),

    // Expenses
    http.get(`${API_BASE_URL}/expenses`, () => {
        return HttpResponse.json([
            { id: 1, exp_date: '2025-01-01', amount: 500, supplier_id: 'SUP001', exptype_id: 'TYPE001', receipt_no: 'REC001' }
        ]);
    }),
    http.post(`${API_BASE_URL}/expenses`, async ({ request }) => {
        const data = await request.json() as any;
        return HttpResponse.json({ ...data, id: Math.floor(Math.random() * 1000) }, { status: 201 });
    }),
    http.put(`${API_BASE_URL}/expenses/:id`, async ({ request, params }) => {
        const data = await request.json() as any;
        return HttpResponse.json({ ...data, id: Number(params.id) });
    }),
    http.delete(`${API_BASE_URL}/expenses/:id`, () => {
        return HttpResponse.json({ message: 'Deleted successfully' });
    }),

    // Settings
    http.get(`${API_BASE_URL}/settings/expense-types`, () => {
        return HttpResponse.json([
            { id: 1, exptype_id: 'TYPE001', exptype_name: 'أدوات مكتبية' }
        ]);
    }),
    http.get(`${API_BASE_URL}/settings/project-types`, () => {
        return HttpResponse.json([
            { id: 1, type_id: 'PRJ001', type_name: 'ديجيتال ماركتنج' }
        ]);
    }),
    http.post(`${API_BASE_URL}/settings/project-types`, async ({ request }) => {
        const data = await request.json() as any;
        return HttpResponse.json({ ...data, id: Math.floor(Math.random() * 1000) }, { status: 201 });
    }),
    http.get(`${API_BASE_URL}/settings/revenue-types`, () => {
        return HttpResponse.json([
            { id: 1, revtype_id: 'REV001', revtype_name: 'إيراد مبيعات', paymethod: 'cash' }
        ]);
    }),

    // Work Orders
    http.get(`${API_BASE_URL}/work-orders`, () => {
        return HttpResponse.json([
            { id: 1, order_code: 'WO001', quotation_id: 1, customer_id: 'CUST001', customer: { name: 'Test Customer' }, quotation: { id: 1, project_name: 'Test Project' } }
        ]);
    }),
    http.post(`${API_BASE_URL}/work-orders`, async ({ request }) => {
        const data = await request.json() as any;
        return HttpResponse.json({ ...data, id: Math.floor(Math.random() * 1000) }, { status: 201 });
    }),
    http.delete(`${API_BASE_URL}/work-orders/:id`, () => {
        return HttpResponse.json({ message: 'Deleted successfully' });
    }),
];
