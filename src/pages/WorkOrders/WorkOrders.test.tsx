import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkOrders } from './WorkOrders';
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

describe('WorkOrders Page CRUD Operations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should list work orders (Read)', async () => {
        render(
            <MemoryRouter>
                <WorkOrders />
            </MemoryRouter>
        );

        expect(screen.getByText('أوامر التشغيل')).toBeDefined();

        await waitFor(() => {
            expect(screen.getByText('WO001')).toBeDefined();
            expect(screen.getByText('Test Project')).toBeDefined();
        });
    });

    it('should add a new work order (Create)', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <WorkOrders />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.queryByText('جاري التحميل...')).toBeNull());

        await user.click(screen.getByText('إضافة أمر تشغيل'));

        const codeInput = screen.getByLabelText(/كود أمر التشغيل \*/i);
        await user.type(codeInput, 'WO-NEW-100');

        const quoteSelect = screen.getByLabelText(/عرض السعر المرتبط \*/i);
        await user.selectOptions(quoteSelect, '1');

        const customerSelect = screen.getByLabelText(/العميل \*/i);
        await user.selectOptions(customerSelect, 'CUST001');

        await user.click(screen.getByRole('button', { name: 'حفظ' }));

        await waitFor(() => {
            expect(screen.queryByText('إضافة أمر تشغيل', { selector: 'h3' })).toBeNull();
        });
    });

    it('should delete a work order (Delete)', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <WorkOrders />
            </MemoryRouter>
        );

        await waitFor(() => screen.getByText('WO001'));

        const deleteButtons = screen.getAllByText('حذف');
        await user.click(deleteButtons[0]);

        expect(window.confirm).toHaveBeenCalled();
    });
});
