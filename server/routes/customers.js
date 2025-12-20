import express from 'express';
import prisma from '../prisma.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// Get all customers
router.get('/', asyncHandler(async (req, res) => {
    const customers = await prisma.customer.findMany({
        orderBy: { name: 'asc' }
    });
    res.json(customers);
}));

// Get single customer with details
router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
        where: { customer_id: id },
        include: {
            revenues: {
                include: { type: true },
                orderBy: { rev_date: 'desc' }
            },
            quotations: {
                orderBy: { quote_date: 'desc' }
            },
            work_orders: true
        }
    });

    if (!customer) {
        res.status(404);
        throw new Error('العميل غير موجود');
    }

    res.json(customer);
}));

// Create new customer
router.post('/', asyncHandler(async (req, res) => {
    console.log('CREATE CUSTOMER ATTEMPT:', req.body);
    const { customer_id, name, contact_person, company_email, contact_email, phone, secondary_phone, address } = req.body;

    // Check if ID exists
    const existing = await prisma.customer.findUnique({
        where: { customer_id }
    });

    if (existing) {
        res.status(400);
        throw new Error('كود العميل موجود بالفعل');
    }

    const newCustomer = await prisma.customer.create({
        data: {
            customer_id,
            name,
            contact_person,
            company_email,
            contact_email,
            phone,
            secondary_phone,
            address
        }
    });
    res.status(201).json(newCustomer);
}));

// Update customer
router.put('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    console.log(`UPDATE CUSTOMER ${id} ATTEMPT:`, req.body);
    const { name, contact_person, company_email, contact_email, phone, secondary_phone, address } = req.body;

    const updatedCustomer = await prisma.customer.update({
        where: { customer_id: id },
        data: {
            name,
            contact_person,
            company_email,
            contact_email,
            phone,
            secondary_phone,
            address
        }
    });
    res.json(updatedCustomer);
}));

// Delete customer
router.delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    await prisma.customer.delete({
        where: { customer_id: id }
    });
    res.json({ message: 'Customer deleted successfully' });
}));

export default router;
