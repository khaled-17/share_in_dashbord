import { describe, it, expect } from 'vitest';
import { supplierService } from './suppliers';

describe('supplierService', () => {
    it('should fetch all suppliers', async () => {
        const suppliers = await supplierService.getAll();
        expect(suppliers).toBeDefined();
        expect(Array.isArray(suppliers)).toBe(true);
        expect(suppliers[0].name).toBe('Test Supplier');
        expect(suppliers[0].supplier_id).toBe('SUP001');
    });
});
