/**
 * @vitest-environment node
 */
import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../app';

// Mock Prisma
vi.mock('../prisma.js', () => ({
    default: {
        customer: {
            findMany: vi.fn().mockResolvedValue([
                { id: 1, customer_id: 'CUST001', name: 'Backend Test' }
            ]),
            findUnique: vi.fn().mockResolvedValue(null),
            create: vi.fn().mockImplementation((args) => Promise.resolve({ id: 2, ...args.data }))
        }
    }
}));

describe('Customers API', () => {
    it('GET /api/customers should return customers', async () => {
        const response = await request(app).get('/api/customers');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body[0].name).toBe('Backend Test');
    });

    it('POST /api/customers should create a customer', async () => {
        const newCustomer = {
            customer_id: 'CUST002',
            name: 'New Backend Customer',
            contact_person: 'John Doe'
        };
        const response = await request(app)
            .post('/api/customers')
            .send(newCustomer);

        expect(response.status).toBe(201);
        expect(response.body.name).toBe('New Backend Customer');
    });
});
