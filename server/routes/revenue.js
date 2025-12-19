import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all revenues
router.get('/', async (req, res) => {
    try {
        const revenues = await prisma.revenue.findMany({
            orderBy: { rev_date: 'desc' },
            include: {
                customer: true,
                type: true
            }
        });
        res.json(revenues);
    } catch (error) {
        console.error('Error fetching revenues:', error);
        res.status(500).json({ error: 'Failed to fetch revenues' });
    }
});

// Create new revenue
router.post('/', async (req, res) => {
    try {
        const { rev_date, amount, receipt_no, customer_id, revtype_id, quote_id, notes } = req.body;

        const newRevenue = await prisma.revenue.create({
            data: {
                rev_date,
                amount,
                receipt_no,
                customer_id,
                revtype_id,
                quote_id,
                notes
            },
            include: {
                customer: true,
                type: true
            }
        });
        res.json(newRevenue);
    } catch (error) {
        console.error('Error creating revenue:', error);
        res.status(500).json({ error: 'Failed to create revenue' });
    }
});

// Update revenue
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rev_date, amount, receipt_no, customer_id, revtype_id, quote_id, notes } = req.body;
        const idInt = parseInt(id);

        const updatedRevenue = await prisma.revenue.update({
            where: { id: idInt },
            data: {
                rev_date,
                amount,
                receipt_no,
                customer_id,
                revtype_id,
                quote_id,
                notes
            },
            include: {
                customer: true,
                type: true
            }
        });
        res.json(updatedRevenue);
    } catch (error) {
        console.error('Error updating revenue:', error);
        res.status(500).json({ error: 'Failed to update revenue' });
    }
});

// Delete revenue
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const idInt = parseInt(id);

        await prisma.revenue.delete({
            where: { id: idInt }
        });
        res.json({ message: 'Revenue deleted successfully' });
    } catch (error) {
        console.error('Error deleting revenue:', error);
        res.status(500).json({ error: 'Failed to delete revenue' });
    }
});

export default router;
