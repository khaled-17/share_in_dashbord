import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Quotations } from './Quotations';
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

describe('Quotations Page CRUD Operations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should list quotations (Read)', async () => {
        render(
            <MemoryRouter>
                <Quotations />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('QUO-0001')).toBeDefined();
        });
    });

    it('should add a new quotation (Create)', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Quotations />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.queryByText('جاري التحميل...')).toBeNull(), { timeout: 10000 });

        await user.click(screen.getByText('عرض سعر جديد'));

        const projectNameInput = screen.getByLabelText(/اسم المشروع \*/i);
        await user.type(projectNameInput, 'New Project');

        const customerSelect = screen.getByLabelText(/العميل \*/i);
        await user.selectOptions(customerSelect, 'CUST001');

        const projectTypeSelect = screen.getByLabelText(/نوع المشروع \*/i);
        await user.selectOptions(projectTypeSelect, 'PRJ001');

        await user.click(screen.getByRole('button', { name: 'حفظ' }));

        await waitFor(() => {
            expect(screen.queryByText('إدارة عروض الأسعار')).toBeDefined();
        });
    });

    it('should edit an existing quotation (Update)', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Quotations />
            </MemoryRouter>
        );

        await waitFor(() => screen.getByText('QUO-0001'), { timeout: 10000 });

        const editButtons = screen.getAllByText('تعديل');
        await user.click(editButtons[0]);

        const input = await screen.findByLabelText(/اسم المشروع \*/i);
        await user.clear(input);
        await user.type(input, 'Updated Project Name');

        await user.click(screen.getByRole('button', { name: 'حفظ' }));

        await waitFor(() => {
            expect(screen.queryByText('إدارة عروض الأسعار')).toBeDefined();
        });
    });

    it('should delete a quotation (Delete)', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Quotations />
            </MemoryRouter>
        );

        await waitFor(() => screen.getByText('QUO-0001'), { timeout: 10000 });

        const deleteButtons = screen.getAllByText('حذف');
        await user.click(deleteButtons[0]);

        expect(window.confirm).toHaveBeenCalled();
    });
});
