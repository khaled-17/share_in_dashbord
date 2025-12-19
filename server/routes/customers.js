import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all customers
router.get('/', async (req, res) => {
    try {
        const customers = await prisma.customer.findMany({
            orderBy: { customer_id: 'asc' }
        });
        res.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

// Create new customer
router.post('/', async (req, res) => {
    try {
        const { customer_id, name, phone, address } = req.body;

        // Check if ID exists
        const existing = await prisma.customer.findUnique({
            where: { customer_id }
        });

        if (existing) {
            return res.status(400).json({ error: 'Customer ID already exists' });
        }

        const newCustomer = await prisma.customer.create({
            data: {
                customer_id,
                name,
                phone,
                address
            }
        });
        res.json(newCustomer);
    } catch (error) {
        console.error('Error creating customer:', error);
        if (error.code === 'P2002') {
            res.status(400).json({ error: 'Customer ID already exists' });
        } else {
            res.status(500).json({ error: 'Failed to create customer' });
        }
    }
});

// Update customer
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, address } = req.body;

        const updatedCustomer = await prisma.customer.update({
            where: { customer_id: id },
            data: {
                name,
                phone,
                address
            }
        });
        res.json(updatedCustomer);
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ error: 'Failed to update customer' });
    }
});

// Delete customer
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.customer.delete({
            where: { customer_id: id }
        });
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({ error: 'Failed to delete customer' });
    }
});

export default router;
