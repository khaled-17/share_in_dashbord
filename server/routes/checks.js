import express from 'express';
import prisma from '../prisma.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// Get all checks
router.get('/', asyncHandler(async (req, res) => {
    const { status, start_date, end_date } = req.query;

    const where = {};

    if (status) where.status = status;

    if (start_date && end_date) {
        where.check_date = {
            gte: start_date,
            lte: end_date
        };
    }

    const checks = await prisma.checkDetail.findMany({
        where,
        include: {
            receipt_voucher: {
                include: {
                    customer: true,
                    partner: true
                }
            },
            payment_voucher: {
                include: {
                    supplier: true,
                    employee: true,
                    partner: true
                }
            }
        },
        orderBy: { check_date: 'desc' }
    });

    res.json(checks);
}));

// Get single check
router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    const check = await prisma.checkDetail.findUnique({
        where: { id: parseInt(id) },
        include: {
            receipt_voucher: {
                include: {
                    customer: true,
                    partner: true
                }
            },
            payment_voucher: {
                include: {
                    supplier: true,
                    employee: true,
                    partner: true
                }
            }
        }
    });

    if (!check) {
        res.status(404);
        throw new Error('الشيك غير موجود');
    }

    res.json(check);
}));

// Update check status
router.put('/:id/status', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['pending', 'cleared', 'bounced', 'cancelled'].includes(status)) {
        res.status(400);
        throw new Error('حالة الشيك غير صحيحة');
    }

    const updatedCheck = await prisma.checkDetail.update({
        where: { id: parseInt(id) },
        data: {
            status,
            notes: notes || undefined
        },
        include: {
            receipt_voucher: true,
            payment_voucher: true
        }
    });

    res.json(updatedCheck);
}));

// Get checks statistics
router.get('/stats/summary', asyncHandler(async (req, res) => {
    const { start_date, end_date } = req.query;

    const where = {};
    if (start_date && end_date) {
        where.check_date = {
            gte: start_date,
            lte: end_date
        };
    }

    const checks = await prisma.checkDetail.findMany({ where });

    const summary = {
        total_count: checks.length,
        total_amount: checks.reduce((sum, c) => sum + c.amount, 0),
        by_status: {
            pending: 0,
            cleared: 0,
            bounced: 0,
            cancelled: 0
        },
        by_type: {
            receipt: 0,
            payment: 0
        }
    };

    // Count by status
    checks.forEach(c => {
        summary.by_status[c.status] = (summary.by_status[c.status] || 0) + 1;
    });

    // Count by type
    const receiptChecks = await prisma.checkDetail.count({
        where: {
            ...where,
            receipt_voucher_id: { not: null }
        }
    });

    const paymentChecks = await prisma.checkDetail.count({
        where: {
            ...where,
            payment_voucher_id: { not: null }
        }
    });

    summary.by_type.receipt = receiptChecks;
    summary.by_type.payment = paymentChecks;

    res.json(summary);
}));

// Get pending checks (due soon)
router.get('/pending/due-soon', asyncHandler(async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const weekLater = futureDate.toISOString().split('T')[0];

    const checks = await prisma.checkDetail.findMany({
        where: {
            status: 'pending',
            check_date: {
                gte: today,
                lte: weekLater
            }
        },
        include: {
            receipt_voucher: {
                include: {
                    customer: true,
                    partner: true
                }
            },
            payment_voucher: {
                include: {
                    supplier: true,
                    employee: true,
                    partner: true
                }
            }
        },
        orderBy: { check_date: 'asc' }
    });

    res.json(checks);
}));

export default router;
