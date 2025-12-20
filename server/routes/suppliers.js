import express from 'express';
import prisma from '../prisma.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// Get all suppliers
router.get('/', asyncHandler(async (req, res) => {
    const suppliers = await prisma.supplier.findMany({
        orderBy: { name: 'asc' }
    });
    res.json(suppliers);
}));

// Get single supplier by supplier_id
router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const supplier = await prisma.supplier.findUnique({
        where: { supplier_id: id },
        include: {
            expenses: {
                include: { type: true },
                orderBy: { exp_date: 'desc' }
            }
        }
    });
    if (!supplier) {
        res.status(404);
        throw new Error('المورد غير موجود');
    }
    res.json(supplier);
}));

// Create new supplier
router.post('/', asyncHandler(async (req, res) => {
    const { supplier_id, name, contact_person, email, phone, secondary_phone, address, speciality } = req.body;

    // Check if ID exists
    const existing = await prisma.supplier.findUnique({
        where: { supplier_id }
    });

    if (existing) {
        res.status(400);
        throw new Error('كود المورد موجود بالفعل');
    }

    const newSupplier = await prisma.supplier.create({
        data: {
            supplier_id,
            name,
            contact_person,
            email,
            phone,
            secondary_phone,
            address,
            speciality
        }
    });
    res.status(201).json(newSupplier);
}));

// Update supplier
router.put('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, contact_person, email, phone, secondary_phone, address, speciality } = req.body;

    const idInt = parseInt(id);

    const updatedSupplier = await prisma.supplier.update({
        where: { id: idInt },
        data: {
            name,
            contact_person,
            email,
            phone,
            secondary_phone,
            address,
            speciality
        }
    });
    res.json(updatedSupplier);
}));

// Delete supplier
router.delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const idInt = parseInt(id);

    await prisma.supplier.delete({
        where: { id: idInt }
    });
    res.json({ message: 'Supplier deleted successfully' });
}));

export default router;
