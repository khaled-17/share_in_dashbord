import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Customers } from './Customers';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock window.confirm
window.confirm = vi.fn(() => true);

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

describe('Customers Page CRUD Operations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should list customers (Read)', async () => {
        render(
            <MemoryRouter>
                <Customers />
            </MemoryRouter>
        );

        expect(screen.getByText('إدارة العملاء')).toBeDefined();

        await waitFor(() => {
            expect(screen.getByText('Test Customer')).toBeDefined();
            expect(screen.getByText('CUST001')).toBeDefined();
        });
    });

    it('should add a new customer (Create)', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Customers />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.queryByText('جاري تحميل العملاء...')).toBeNull());

        // Open Modal
        await user.click(screen.getByText('إضافة عميل جديد'));

        // Fill form
        const nameInput = screen.getByLabelText(/اسم الشركة \*/i);
        await user.type(nameInput, 'New Corp');

        // Submit
        await user.click(screen.getByRole('button', { name: 'إضافة العميل' }));

        await waitFor(() => {
            expect(screen.queryByText('إضافة عميل جديد', { selector: 'h3' })).toBeNull();
        });
    });

    it('should edit an existing customer (Update)', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Customers />
            </MemoryRouter>
        );

        await waitFor(() => screen.getByText('Test Customer'));

        const editButtons = screen.getAllByText('تعديل');
        await user.click(editButtons[0]);

        const nameInput = screen.getByLabelText(/اسم الشركة \*/i);
        await user.clear(nameInput);
        await user.type(nameInput, 'Updated Customer');

        await user.click(screen.getByRole('button', { name: 'تحديث البيانات' }));

        await waitFor(() => {
            expect(screen.queryByText('تعديل بيانات العميل', { selector: 'h3' })).toBeNull();
        });
    });

    it('should delete a customer (Delete)', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Customers />
            </MemoryRouter>
        );

        await waitFor(() => screen.getByText('Test Customer'));

        const deleteButtons = screen.getAllByText('حذف');
        await user.click(deleteButtons[0]);

        expect(window.confirm).toHaveBeenCalled();
    });
});
