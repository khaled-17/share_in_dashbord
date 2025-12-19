import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get Reviews endpoint
router.get('/', async (req, res) => {
    try {
        const reviews = await prisma.customerReview.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// Create Review endpoint
router.post('/', async (req, res) => {
    try {
        const { name, role, review, rating, avatar, phoneNumber } = req.body;
        const newReview = await prisma.customerReview.create({
            data: {
                name,
                role,
                review,
                rating,
                avatar,
                phoneNumber
            }
        });
        res.json(newReview);
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'Failed to create review' });
    }
});

export default router;
