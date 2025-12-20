/**
 * @vitest-environment node
 */
import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../app';

// Mock Prisma
vi.mock('../prisma.js', () => ({
    default: {
        quotation: {
            findMany: vi.fn().mockResolvedValue([
                {
                    id: 1,
                    project_name: 'Quotation Test',
                    totalamount: 5000,
                    customer: { name: 'Linked Customer' }
                }
            ]),
            findUnique: vi.fn().mockResolvedValue(null),
        }
    }
}));

describe('Quotations API', () => {
    it('GET /api/quotations should return quotations with customer names', async () => {
        const response = await request(app).get('/api/quotations');
        expect(response.status).toBe(200);
        expect(response.body[0].project_name).toBe('Quotation Test');
        expect(response.body[0].customer.name).toBe('Linked Customer');
    });
});
