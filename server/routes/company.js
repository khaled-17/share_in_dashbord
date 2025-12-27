import express from 'express';
import prisma from '../prisma.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// Get company settings
router.get('/', asyncHandler(async (req, res) => {
    let settings = await prisma.companySettings.findFirst();

    // If no settings exist, create default
    if (!settings) {
        settings = await prisma.companySettings.create({
            data: {
                name: 'شركة سهم (Share In)',
                description: 'شركة رائدة في مجال إدارة الفعاليات والمؤتمرات',
            }
        });
    }

    res.json(settings);
}));

// Update company settings
router.put('/', asyncHandler(async (req, res) => {
    const { name, description, about, address, phone, email, website } = req.body;

    let settings = await prisma.companySettings.findFirst();

    if (settings) {
        settings = await prisma.companySettings.update({
            where: { id: settings.id },
            data: { name, description, about, address, phone, email, website }
        });
    } else {
        settings = await prisma.companySettings.create({
            data: { name, description, about, address, phone, email, website }
        });
    }

    res.json(settings);
}));

export default router;
