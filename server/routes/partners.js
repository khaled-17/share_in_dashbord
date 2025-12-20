import express from 'express';
import prisma from '../prisma.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// Get all partners
router.get('/', asyncHandler(async (req, res) => {
    const partners = await prisma.partner.findMany({
        orderBy: { created_at: 'desc' }
    });
    res.json(partners);
}));

// Get single partner by ID
router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const partner = await prisma.partner.findUnique({
        where: { id: parseInt(id) },
        include: {
            receipt_vouchers: {
                orderBy: { voucher_date: 'desc' }
            },
            payment_vouchers: {
                orderBy: { voucher_date: 'desc' }
            }
        }
    });

    if (!partner) {
        res.status(404);
        throw new Error('الشريك غير موجود');
    }

    res.json(partner);
}));

// Create new partner
router.post('/', asyncHandler(async (req, res) => {
    const { partner_code, name, phone, email, initial_capital } = req.body;

    // Check if partner code exists
    const existing = await prisma.partner.findUnique({
        where: { partner_code }
    });

    if (existing) {
        res.status(400);
        throw new Error('كود الشريك موجود بالفعل');
    }

    const newPartner = await prisma.partner.create({
        data: {
            partner_code,
            name,
            phone,
            email,
            initial_capital: parseFloat(initial_capital) || 0,
            current_capital: parseFloat(initial_capital) || 0
        }
    });

    res.status(201).json(newPartner);
}));

// Update partner
router.put('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, phone, email } = req.body;

    const updatedPartner = await prisma.partner.update({
        where: { id: parseInt(id) },
        data: {
            name,
            phone,
            email
        }
    });

    res.json(updatedPartner);
}));

// Delete partner
router.delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if partner has any vouchers
    const partner = await prisma.partner.findUnique({
        where: { id: parseInt(id) },
        include: {
            receipt_vouchers: true,
            payment_vouchers: true
        }
    });

    if (partner && (partner.receipt_vouchers.length > 0 || partner.payment_vouchers.length > 0)) {
        res.status(400);
        throw new Error('لا يمكن حذف شريك له سندات مسجلة');
    }

    await prisma.partner.delete({
        where: { id: parseInt(id) }
    });

    res.json({ message: 'تم حذف الشريك بنجاح' });
}));

// Get partner financial summary
router.get('/:id/summary', asyncHandler(async (req, res) => {
    const { id } = req.params;

    const partner = await prisma.partner.findUnique({
        where: { id: parseInt(id) },
        include: {
            receipt_vouchers: {
                where: { source_type: 'partner_capital' }
            },
            payment_vouchers: {
                where: { beneficiary_type: 'partner_withdrawal' }
            }
        }
    });

    if (!partner) {
        res.status(404);
        throw new Error('الشريك غير موجود');
    }

    const totalCapitalIncrease = partner.receipt_vouchers.reduce((sum, v) => sum + v.amount, 0);
    const totalWithdrawals = partner.payment_vouchers.reduce((sum, v) => sum + v.amount, 0);

    res.json({
        partner_code: partner.partner_code,
        name: partner.name,
        initial_capital: partner.initial_capital,
        current_capital: partner.current_capital,
        total_capital_increase: totalCapitalIncrease,
        total_withdrawals: totalWithdrawals,
        net_capital: partner.initial_capital + totalCapitalIncrease - totalWithdrawals
    });
}));

export default router;
