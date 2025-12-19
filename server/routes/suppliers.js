import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all suppliers
router.get('/', async (req, res) => {
    try {
        const suppliers = await prisma.supplier.findMany({
            orderBy: { id: 'asc' }
        });
        res.json(suppliers);
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        res.status(500).json({ error: 'Failed to fetch suppliers' });
    }
});

// Create new supplier
router.post('/', async (req, res) => {
    try {
        const { supplier_id, name, phone, speciality } = req.body;

        // Check if ID exists
        const existing = await prisma.supplier.findUnique({
            where: { supplier_id }
        });

        if (existing) {
            return res.status(400).json({ error: 'Supplier ID already exists' });
        }

        const newSupplier = await prisma.supplier.create({
            data: {
                supplier_id,
                name,
                phone,
                speciality
            }
        });
        res.json(newSupplier);
    } catch (error) {
        console.error('Error creating supplier:', error);
        if (error.code === 'P2002') {
            res.status(400).json({ error: 'Supplier ID already exists' });
        } else {
            res.status(500).json({ error: 'Failed to create supplier' });
        }
    }
});

// Update supplier
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, speciality } = req.body;

        // Parse ID as integer since it's an autoincrement int in schema
        const idInt = parseInt(id);

        const updatedSupplier = await prisma.supplier.update({
            where: { id: idInt },
            data: {
                name,
                phone,
                speciality
            }
        });
        res.json(updatedSupplier);
    } catch (error) {
        console.error('Error updating supplier:', error);
        res.status(500).json({ error: 'Failed to update supplier' });
    }
});

// Delete supplier
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const idInt = parseInt(id);

        await prisma.supplier.delete({
            where: { id: idInt }
        });
        res.json({ message: 'Supplier deleted successfully' });
    } catch (error) {
        console.error('Error deleting supplier:', error);
        res.status(500).json({ error: 'Failed to delete supplier' });
    }
});

export default router;
