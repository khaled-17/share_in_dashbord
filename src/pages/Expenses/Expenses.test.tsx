import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Expenses } from './Expenses';
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

describe('Expenses Page CRUD Operations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should list expenses (Read)', async () => {
        render(
            <MemoryRouter>
                <Expenses />
            </MemoryRouter>
        );

        expect(screen.getByText('إدارة المصروفات')).toBeDefined();

        await waitFor(() => {
            expect(screen.getByText(/٥٠٠/)).toBeDefined();
        });
    });

    it('should add a new expense (Create)', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Expenses />
            </MemoryRouter>
        );

        // Wait for data load
        await waitFor(() => expect(screen.queryByText('جاري التحميل...')).toBeNull());

        await user.click(screen.getByText('إضافة مصروف جديد'));

        const supplierSelect = screen.getByLabelText(/المورد \*/i);
        await user.selectOptions(supplierSelect, 'SUP001');

        const typeSelect = screen.getByLabelText(/نوع المصروف \*/i);
        await user.selectOptions(typeSelect, 'TYPE001');

        const amountInput = screen.getByLabelText(/المبلغ \*/i);
        await user.type(amountInput, '1000');

        await user.click(screen.getByRole('button', { name: 'إضافة' }));

        await waitFor(() => {
            expect(screen.queryByText('إضافة مصروف جديد', { selector: 'h3' })).toBeNull();
        });
    });

    it('should edit an existing expense (Update)', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Expenses />
            </MemoryRouter>
        );

        await waitFor(() => screen.getByText(/٥٠٠/));

        const editButtons = screen.getAllByText('تعديل');
        await user.click(editButtons[0]);

        const amountInput = screen.getByLabelText(/المبلغ \*/i);
        await user.clear(amountInput);
        await user.type(amountInput, '750');

        await user.click(screen.getByRole('button', { name: 'تحديث' }));

        await waitFor(() => {
            expect(screen.queryByText('تعديل مصروف')).toBeNull();
        });
    });

    it('should delete an expense (Delete)', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Expenses />
            </MemoryRouter>
        );

        await waitFor(() => screen.getByText(/٥٠٠/));

        const deleteButtons = screen.getAllByText('حذف');
        await user.click(deleteButtons[0]);

        expect(window.confirm).toHaveBeenCalled();
    });
});
