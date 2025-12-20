import { describe, it, expect } from 'vitest';
import { customerService } from './customers';

describe('customerService', () => {
    it('should fetch all customers', async () => {
        const customers = await customerService.getAll();
        expect(customers).toBeDefined();
        expect(Array.isArray(customers)).toBe(true);
        expect(customers[0].name).toBe('Test Customer');
    });

    it('should create a new customer', async () => {
        const newCustomer = {
            customer_id: 'CUST002',
            name: 'New Customer',
            contact_person: 'Jane Doe',
            company_email: 'jane@company.com'
        };
        const result = await customerService.create(newCustomer);
        expect(result).toBeDefined();
        expect(result.name).toBe('New Customer');
    });
});
