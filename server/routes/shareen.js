import express from 'express';
import prisma from '../prisma.js';

const router = express.Router();

// Get all shareen items
router.get('/', async (req, res) => {
    try {
        const items = await prisma.shareen.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json(items);
    } catch (error) {
        console.error('Error fetching shareen items:', error);
        res.status(500).json({ error: 'Failed to fetch shareen items' });
    }
});

// Create new shareen item (optional, if needed, though frontend doesn't seem to have a create form yet)
// But good to have based on standard CRUD
router.post('/', async (req, res) => {
    try {
        const newItem = await prisma.shareen.create({
            data: {} // No fields other than defaults
        });
        res.json(newItem);
    } catch (error) {
        console.error('Error creating shareen item:', error);
        res.status(500).json({ error: 'Failed to create shareen item' });
    }
});

export default router;
