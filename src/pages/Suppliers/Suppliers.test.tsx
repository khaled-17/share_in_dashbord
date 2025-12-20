import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suppliers } from './Suppliers';
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

describe('Suppliers Page CRUD Operations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should list suppliers (Read)', async () => {
        render(
            <MemoryRouter>
                <Suppliers />
            </MemoryRouter>
        );

        expect(screen.getByText('إدارة الموردين')).toBeDefined();

        await waitFor(() => {
            expect(screen.getByText('Test Supplier')).toBeDefined();
            expect(screen.getByText('SUP001')).toBeDefined();
        });
    });

    it('should add a new supplier (Create)', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Suppliers />
            </MemoryRouter>
        );

        await user.click(screen.getByText('إضافة مورد جديد'));

        const nameInput = screen.getByLabelText(/اسم الشركة/i);
        await user.type(nameInput, 'New Supplier Ltd');

        await user.click(screen.getByRole('button', { name: 'إضافة' }));

        await waitFor(() => {
            expect(screen.queryByText('إضافة مورد جديد', { selector: 'h3' })).toBeNull();
        });
    });

    it('should edit an existing supplier (Update)', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Suppliers />
            </MemoryRouter>
        );

        await waitFor(() => screen.getByText('Test Supplier'));

        const editButtons = screen.getAllByText('تعديل');
        await user.click(editButtons[0]);

        const nameInput = screen.getByLabelText(/اسم الشركة/i);
        await user.clear(nameInput);
        await user.type(nameInput, 'Updated Supplier Name');
        await user.click(screen.getByRole('button', { name: 'تحديث' }));

        await waitFor(() => {
            expect(screen.queryByText('تعديل مورد')).toBeNull();
        });
    });

    it('should delete a supplier (Delete)', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Suppliers />
            </MemoryRouter>
        );

        await waitFor(() => screen.getByText('Test Supplier'));

        const deleteButtons = screen.getAllByText('حذف');
        await user.click(deleteButtons[0]);

        expect(window.confirm).toHaveBeenCalled();
    });
});
