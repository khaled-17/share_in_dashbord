import express from 'express';
import prisma from '../prisma.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// Get all payment vouchers
router.get('/', asyncHandler(async (req, res) => {
    const { start_date, end_date, beneficiary_type, payment_method } = req.query;

    const where = {};

    if (start_date && end_date) {
        where.voucher_date = {
            gte: start_date,
            lte: end_date
        };
    }

    if (beneficiary_type) where.beneficiary_type = beneficiary_type;
    if (payment_method) where.payment_method = payment_method;

    const vouchers = await prisma.paymentVoucher.findMany({
        where,
        include: {
            supplier: true,
            employee: true,
            partner: true,
            expense_type: true,
            check: true
        },
        orderBy: { voucher_date: 'desc' }
    });

    res.json(vouchers);
}));

// Get single payment voucher
router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    const voucher = await prisma.paymentVoucher.findUnique({
        where: { id: parseInt(id) },
        include: {
            supplier: true,
            employee: true,
            partner: true,
            expense_type: true,
            check: true
        }
    });

    if (!voucher) {
        res.status(404);
        throw new Error('سند الصرف غير موجود');
    }

    res.json(voucher);
}));

// Create new payment voucher
router.post('/', asyncHandler(async (req, res) => {
    const {
        voucher_number,
        voucher_date,
        amount,
        beneficiary_type,
        supplier_id,
        employee_id,
        partner_id,
        expense_type_id,
        payment_method,
        check_details,
        description,
        paid_to,
        created_by
    } = req.body;

    // Check if voucher number exists
    const existing = await prisma.paymentVoucher.findUnique({
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

        // Create payment voucher
        const voucher = await tx.paymentVoucher.create({
            data: {
                voucher_number,
                voucher_date,
                amount: parseFloat(amount),
                beneficiary_type,
                supplier_id,
                employee_id,
                partner_id: partner_id ? parseInt(partner_id) : null,
                expense_type_id,
                payment_method,
                check_id: checkId,
                description,
                paid_to,
                created_by
            },
            include: {
                supplier: true,
                employee: true,
                partner: true,
                expense_type: true,
                check: true
            }
        });

        // Update partner capital if beneficiary is partner_withdrawal
        if (beneficiary_type === 'partner_withdrawal' && partner_id) {
            await tx.partner.update({
                where: { id: parseInt(partner_id) },
                data: {
                    current_capital: {
                        decrement: parseFloat(amount)
                    }
                }
            });
        }

        return voucher;
    });

    res.status(201).json(result);
}));

// Update payment voucher
router.put('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { description, paid_to } = req.body;

    const updatedVoucher = await prisma.paymentVoucher.update({
        where: { id: parseInt(id) },
        data: {
            description,
            paid_to
        },
        include: {
            supplier: true,
            employee: true,
            partner: true,
            expense_type: true,
            check: true
        }
    });

    res.json(updatedVoucher);
}));

// Delete payment voucher
router.delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    const voucher = await prisma.paymentVoucher.findUnique({
        where: { id: parseInt(id) },
        include: { check: true }
    });

    if (!voucher) {
        res.status(404);
        throw new Error('سند الصرف غير موجود');
    }

    await prisma.$transaction(async (tx) => {
        // Reverse partner capital if applicable
        if (voucher.beneficiary_type === 'partner_withdrawal' && voucher.partner_id) {
            await tx.partner.update({
                where: { id: voucher.partner_id },
                data: {
                    current_capital: {
                        increment: voucher.amount
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
        await tx.paymentVoucher.delete({
            where: { id: parseInt(id) }
        });
    });

    res.json({ message: 'تم حذف سند الصرف بنجاح' });
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

    const vouchers = await prisma.paymentVoucher.findMany({ where });

    const summary = {
        total_amount: vouchers.reduce((sum, v) => sum + v.amount, 0),
        total_count: vouchers.length,
        by_beneficiary_type: {},
        by_payment_method: {},
        pending_checks: 0
    };

    // Group by beneficiary type
    vouchers.forEach(v => {
        summary.by_beneficiary_type[v.beneficiary_type] = (summary.by_beneficiary_type[v.beneficiary_type] || 0) + v.amount;
        summary.by_payment_method[v.payment_method] = (summary.by_payment_method[v.payment_method] || 0) + v.amount;
    });

    // Count pending checks
    const pendingChecks = await prisma.checkDetail.count({
        where: {
            status: 'pending',
            payment_voucher_id: { not: null }
        }
    });
    summary.pending_checks = pendingChecks;

    res.json(summary);
}));

export default router;
