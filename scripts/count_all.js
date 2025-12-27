import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const counts = {
            customers: await prisma.customer.count(),
            suppliers: await prisma.supplier.count(),
            revenue: await prisma.revenue.count(),
            expenses: await prisma.expense.count(),
            quotations: await prisma.quotation.count(),
            workOrders: await prisma.workOrder.count(),
            partners: await prisma.partner.count(),
            receiptVouchers: await prisma.receiptVoucher.count(),
            paymentVouchers: await prisma.paymentVoucher.count(),
            checks: await prisma.checkDetail.count(),
        };
        console.log('Database Counts:', JSON.stringify(counts, null, 2));
    } catch (error) {
        console.error('Error counting records:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
