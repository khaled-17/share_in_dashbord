import express from 'express';
import prisma from '../prisma.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// Get all receipt vouchers
router.get('/', asyncHandler(async (req, res) => {
    const { start_date, end_date, source_type, payment_method } = req.query;

    const where = {};

    if (start_date && end_date) {
        where.voucher_date = {
            gte: start_date,
            lte: end_date
        };
    }

    if (source_type) where.source_type = source_type;
    if (payment_method) where.payment_method = payment_method;

    const vouchers = await prisma.receiptVoucher.findMany({
        where,
        include: {
            customer: true,
            partner: true,
            check: true
        },
        orderBy: { voucher_date: 'desc' }
    });

    res.json(vouchers);
}));

// Get single receipt voucher
router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    const voucher = await prisma.receiptVoucher.findUnique({
        where: { id: parseInt(id) },
        include: {
            customer: true,
            partner: true,
            check: true
        }
    });

    if (!voucher) {
        res.status(404);
        throw new Error('سند القبض غير موجود');
    }

    res.json(voucher);
}));

// Create new receipt voucher
router.post('/', asyncHandler(async (req, res) => {
    const {
        voucher_number,
        voucher_date,
        amount,
        source_type,
        customer_id,
        partner_id,
        payment_method,
        check_details,
        description,
        received_from,
        created_by
    } = req.body;

    // Check if voucher number exists
    const existing = await prisma.receiptVoucher.findUnique({
        where: { voucher_number }
    });

    if (existing) {
        res.status(400);
        throw new Error('رقم السند موجود بالفعل');
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
        let checkId = null;

        // Create check if payment method is check
        if (payment_method === 'check' && check_details) {
            const check = await tx.checkDetail.create({
                data: {
                    check_number: check_details.check_number,
                    bank_name: check_details.bank_name,
                    check_date: check_details.check_date,
                    beneficiary_name: check_details.beneficiary_name,
                    amount: parseFloat(amount),
                    status: check_details.status || 'pending',
                    notes: check_details.notes
                }
            });
            checkId = check.id;
        }

        // Create receipt voucher
        const voucher = await tx.receiptVoucher.create({
            data: {
                voucher_number,
                voucher_date,
                amount: parseFloat(amount),
                source_type,
                customer_id,
                partner_id: partner_id ? parseInt(partner_id) : null,
                payment_method,
                check_id: checkId,
                description,
                received_from,
                created_by
            },
            include: {
                customer: true,
                partner: true,
                check: true
            }
        });

        // Update partner capital if source is partner_capital
        if (source_type === 'partner_capital' && partner_id) {
            await tx.partner.update({
                where: { id: parseInt(partner_id) },
                data: {
                    current_capital: {
                        increment: parseFloat(amount)
                    }
                }
            });
        }

        return voucher;
    });

    res.status(201).json(result);
}));

// Update receipt voucher
router.put('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { description, received_from } = req.body;

    const updatedVoucher = await prisma.receiptVoucher.update({
        where: { id: parseInt(id) },
        data: {
            description,
            received_from
        },
        include: {
            customer: true,
            partner: true,
            check: true
        }
    });

    res.json(updatedVoucher);
}));

// Delete receipt voucher
router.delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    const voucher = await prisma.receiptVoucher.findUnique({
        where: { id: parseInt(id) },
        include: { check: true }
    });

    if (!voucher) {
        res.status(404);
        throw new Error('سند القبض غير موجود');
    }

    await prisma.$transaction(async (tx) => {
        // Reverse partner capital if applicable
        if (voucher.source_type === 'partner_capital' && voucher.partner_id) {
            await tx.partner.update({
                where: { id: voucher.partner_id },
                data: {
                    current_capital: {
                        decrement: voucher.amount
                    }
                }
            });
        }

        // Delete check if exists
        if (voucher.check_id) {
            await tx.checkDetail.delete({
                where: { id: voucher.check_id }
            });
        }

        // Delete voucher
        await tx.receiptVoucher.delete({
            where: { id: parseInt(id) }
        });
    });

    res.json({ message: 'تم حذف سند القبض بنجاح' });
}));

// Get summary statistics
router.get('/stats/summary', asyncHandler(async (req, res) => {
    const { start_date, end_date } = req.query;

    const where = {};
    if (start_date && end_date) {
        where.voucher_date = {
            gte: start_date,
            lte: end_date
        };
    }

    const vouchers = await prisma.receiptVoucher.findMany({ where });

    const summary = {
        total_amount: vouchers.reduce((sum, v) => sum + v.amount, 0),
        total_count: vouchers.length,
        by_source_type: {},
        by_payment_method: {},
        pending_checks: 0
    };

    // Group by source type
    vouchers.forEach(v => {
        summary.by_source_type[v.source_type] = (summary.by_source_type[v.source_type] || 0) + v.amount;
        summary.by_payment_method[v.payment_method] = (summary.by_payment_method[v.payment_method] || 0) + v.amount;
    });

    // Count pending checks
    const pendingChecks = await prisma.checkDetail.count({
        where: {
            status: 'pending',
            receipt_voucher_id: { not: null }
        }
    });
    summary.pending_checks = pendingChecks;

    res.json(summary);
}));

export default router;
