import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Employees } from './Employees';
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

describe('Employees Page CRUD Operations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should list employees (Read)', async () => {
        render(
            <MemoryRouter>
                <Employees />
            </MemoryRouter>
        );

        expect(screen.getByText('إدارة الموظفين')).toBeDefined();

        await waitFor(() => {
            expect(screen.getByText('Employee One')).toBeDefined();
            expect(screen.getByText('EMP001')).toBeDefined();
        });
    });

    it('should add a new employee (Create)', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Employees />
            </MemoryRouter>
        );

        await user.click(screen.getByText('إضافة موظف جديد'));

        const nameInput = screen.getByLabelText(/الاسم الكامل \*/i);
        await user.type(nameInput, 'New Employee');

        const salaryInput = screen.getByLabelText(/الراتب/i);
        await user.type(salaryInput, '3000');

        await user.click(screen.getByRole('button', { name: 'إضافة' }));

        await waitFor(() => {
            expect(screen.queryByText('إضافة موظف جديد', { selector: 'h3' })).toBeNull();
        });
    });

    it('should edit an existing employee (Update)', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Employees />
            </MemoryRouter>
        );

        await waitFor(() => screen.getByText('Employee One'));

        const editButtons = screen.getAllByText('تعديل');
        await user.click(editButtons[0]);

        const nameInput = screen.getByLabelText(/الاسم الكامل \*/i);
        await user.clear(nameInput);
        await user.type(nameInput, 'Updated Employee Name');
        await user.click(screen.getByRole('button', { name: 'تحديث' }));

        await waitFor(() => {
            expect(screen.queryByText('تعديل موظف')).toBeNull();
        });
    });

    it('should delete an employee (Delete)', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Employees />
            </MemoryRouter>
        );

        await waitFor(() => screen.getByText('Employee One'));

        const deleteButtons = screen.getAllByText('حذف');
        await user.click(deleteButtons[0]);

        expect(window.confirm).toHaveBeenCalled();
    });
});
