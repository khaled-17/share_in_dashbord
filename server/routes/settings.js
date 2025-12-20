import express from 'express';
import prisma from '../prisma.js';

const router = express.Router();

// =======================
// Expense Types
// =======================

// Get all expense types
router.get('/expense-types', async (req, res) => {
    try {
        const types = await prisma.expenseType.findMany({
            orderBy: { id: 'asc' }
        });
        res.json(types);
    } catch (error) {
        console.error('Error fetching expense types:', error);
        res.status(500).json({ error: 'Failed to fetch expense types' });
    }
});

// Create expense type
router.post('/expense-types', async (req, res) => {
    try {
        const { exptype_id, exptype_name, category } = req.body;

        const existing = await prisma.expenseType.findUnique({
            where: { exptype_id }
        });

        if (existing) {
            return res.status(400).json({ error: 'Expense Type ID already exists' });
        }

        const newType = await prisma.expenseType.create({
            data: {
                exptype_id,
                exptype_name,
                category
            }
        });
        res.json(newType);
    } catch (error) {
        console.error('Error creating expense type:', error);
        if (error.code === 'P2002') {
            res.status(400).json({ error: 'Expense Type ID already exists' });
        } else {
            res.status(500).json({ error: 'Failed to create expense type' });
        }
    }
});

// Update expense type
router.put('/expense-types/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { exptype_name, category } = req.body;
        const idInt = parseInt(id);

        const updatedType = await prisma.expenseType.update({
            where: { id: idInt },
            data: {
                exptype_name,
                category
            }
        });
        res.json(updatedType);
    } catch (error) {
        console.error('Error updating expense type:', error);
        res.status(500).json({ error: 'Failed to update expense type' });
    }
});

// Delete expense type
router.delete('/expense-types/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const idInt = parseInt(id);

        await prisma.expenseType.delete({
            where: { id: idInt }
        });
        res.json({ message: 'Expense type deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense type:', error);
        res.status(500).json({ error: 'Failed to delete expense type' });
    }
});

// =======================
// Revenue Types
// =======================

// Get all revenue types
router.get('/revenue-types', async (req, res) => {
    try {
        const types = await prisma.revenueType.findMany({
            orderBy: { id: 'asc' }
        });
        res.json(types);
    } catch (error) {
        console.error('Error fetching revenue types:', error);
        res.status(500).json({ error: 'Failed to fetch revenue types' });
    }
});

// Create revenue type
router.post('/revenue-types', async (req, res) => {
    try {
        const { revtype_id, revtype_name, paymethod } = req.body;

        const existing = await prisma.revenueType.findUnique({
            where: { revtype_id }
        });

        if (existing) {
            return res.status(400).json({ error: 'Revenue Type ID already exists' });
        }

        const newType = await prisma.revenueType.create({
            data: {
                revtype_id,
                revtype_name,
                paymethod
            }
        });
        res.json(newType);
    } catch (error) {
        console.error('Error creating revenue type:', error);
        if (error.code === 'P2002') {
            res.status(400).json({ error: 'Revenue Type ID already exists' });
        } else {
            res.status(500).json({ error: 'Failed to create revenue type' });
        }
    }
});

// Update revenue type
router.put('/revenue-types/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { revtype_name, paymethod } = req.body;
        const idInt = parseInt(id);

        const updatedType = await prisma.revenueType.update({
            where: { id: idInt },
            data: {
                revtype_name,
                paymethod
            }
        });
        res.json(updatedType);
    } catch (error) {
        console.error('Error updating revenue type:', error);
        res.status(500).json({ error: 'Failed to update revenue type' });
    }
});

// Delete revenue type
router.delete('/revenue-types/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const idInt = parseInt(id);

        await prisma.revenueType.delete({
            where: { id: idInt }
        });
        res.json({ message: 'Revenue type deleted successfully' });
    } catch (error) {
        console.error('Error deleting revenue type:', error);
        res.status(500).json({ error: 'Failed to delete revenue type' });
    }
});

// =======================
// Project Types
// =======================

// Get all project types
router.get('/project-types', async (req, res) => {
    try {
        const types = await prisma.projectType.findMany({
            orderBy: { id: 'asc' }
        });
        res.json(types);
    } catch (error) {
        console.error('Error fetching project types:', error);
        res.status(500).json({ error: 'Failed to fetch project types' });
    }
});

// Create project type
router.post('/project-types', async (req, res) => {
    try {
        const { type_id, type_name } = req.body;

        const existing = await prisma.projectType.findUnique({
            where: { type_id }
        });

        if (existing) {
            return res.status(400).json({ error: 'Project Type ID already exists' });
        }

        const newType = await prisma.projectType.create({
            data: {
                type_id,
                type_name
            }
        });
        res.json(newType);
    } catch (error) {
        console.error('Error creating project type:', error);
        if (error.code === 'P2002') {
            res.status(400).json({ error: 'Project Type ID already exists' });
        } else {
            res.status(500).json({ error: 'Failed to create project type' });
        }
    }
});

// Update project type
router.put('/project-types/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { type_name } = req.body;
        const idInt = parseInt(id);

        const updatedType = await prisma.projectType.update({
            where: { id: idInt },
            data: {
                type_name
            }
        });
        res.json(updatedType);
    } catch (error) {
        console.error('Error updating project type:', error);
        res.status(500).json({ error: 'Failed to update project type' });
    }
});

// Delete project type
router.delete('/project-types/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const idInt = parseInt(id);

        await prisma.projectType.delete({
            where: { id: idInt }
        });
        res.json({ message: 'Project type deleted successfully' });
    } catch (error) {
        console.error('Error deleting project type:', error);
        res.status(500).json({ error: 'Failed to delete project type' });
    }
});

export default router;

