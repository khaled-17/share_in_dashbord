import express from 'express';
import prisma from '../prisma.js';

const router = express.Router();

// Get all expenses
router.get('/', async (req, res) => {
    try {
        const expenses = await prisma.expense.findMany({
            orderBy: { exp_date: 'desc' },
            include: {
                supplier: true,
                type: true
            }
        });
        res.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

// Create new expense
router.post('/', async (req, res) => {
    try {
        const { exp_date, amount, receipt_no, supplier_id, exptype_id, quote_id, notes } = req.body;

        const newExpense = await prisma.expense.create({
            data: {
                exp_date,
                amount,
                receipt_no,
                supplier_id,
                exptype_id,
                quote_id,
                notes
            },
            include: {
                supplier: true,
                type: true
            }
        });
        res.json(newExpense);
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: 'Failed to create expense' });
    }
});

// Update expense
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { exp_date, amount, receipt_no, supplier_id, exptype_id, quote_id, notes } = req.body;
        const idInt = parseInt(id);

        const updatedExpense = await prisma.expense.update({
            where: { id: idInt },
            data: {
                exp_date,
                amount,
                receipt_no,
                supplier_id,
                exptype_id,
                quote_id,
                notes
            },
            include: {
                supplier: true,
                type: true
            }
        });
        res.json(updatedExpense);
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ error: 'Failed to update expense' });
    }
});

// Delete expense
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const idInt = parseInt(id);

        await prisma.expense.delete({
            where: { id: idInt }
        });
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Failed to delete expense' });
    }
});

export default router;
