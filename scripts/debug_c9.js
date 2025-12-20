import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const data = {
        customer_id: 'C00009',
        name: 'مثال: شركة النور للتجارة',
        contact_person: 'اسم الشخص المسئول عن التواصل',
        company_email: 'company@example.com',
        contact_email: 'person@example.com',
        phone: '01XXXXXXXXX',
        secondary_phone: '01XXXXXXXXX',
        address: 'العنوان الكامل'
    };

    console.log('Attempting to create customer C00009 with user data...');
    try {
        const result = await prisma.customer.create({ data });
        console.log('Created successfully:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('CREATE FAILED:', error);
    }

    const check = await prisma.customer.findUnique({ where: { customer_id: 'C00009' } });
    console.log('Final check in DB:', check ? 'EXISTS' : 'NOT FOUND');

    if (check) {
        await prisma.customer.delete({ where: { customer_id: 'C00009' } });
        console.log('Deleted C00009');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
