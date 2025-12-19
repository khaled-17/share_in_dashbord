import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all work orders
router.get('/', async (req, res) => {
    try {
        const workOrders = await prisma.workOrder.findMany({
            orderBy: { created_at: 'desc' },
            include: {
                customer: true,
                quotation: true
            }
        });
        res.json(workOrders);
    } catch (error) {
        console.error('Error fetching work orders:', error);
        res.status(500).json({ error: 'Failed to fetch work orders' });
    }
});

// Create new work order
router.post('/', async (req, res) => {
    try {
        const { order_code, quotation_id, customer_id } = req.body;

        const newWorkOrder = await prisma.workOrder.create({
            data: {
                order_code,
                quotation_id: parseInt(quotation_id),
                customer_id
            },
            include: {
                customer: true,
                quotation: true
            }
        });
        res.json(newWorkOrder);
    } catch (error) {
        console.error('Error creating work order:', error);
        res.status(500).json({ error: 'Failed to create work order' });
    }
});

// Delete work order
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const idInt = parseInt(id);

        await prisma.workOrder.delete({
            where: { id: idInt }
        });
        res.json({ message: 'Work order deleted successfully' });
    } catch (error) {
        console.error('Error deleting work order:', error);
        res.status(500).json({ error: 'Failed to delete work order' });
    }
});

export default router;
