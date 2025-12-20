import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const data = {
        customer_id: 'C00009',
        name: 'شركة النور للتجارة',
        contact_person: 'اسم الشخص المسئول عن التواصل',
        company_email: 'company@example.com',
        contact_email: 'person@example.com',
        phone: '01012345678',
        secondary_phone: '01087654321',
        address: 'العنوان الكامل'
    };

    console.log('Attempting to create customer C00009...');
    const result = await prisma.customer.create({ data });
    console.log('Created successfully:', JSON.stringify(result, null, 2));

    const check = await prisma.customer.findUnique({ where: { customer_id: 'C00009' } });
    console.log('Check findUnique:', JSON.stringify(check, null, 2));

    await prisma.customer.delete({ where: { customer_id: 'C00009' } });
    console.log('Cleaned up C00009');
}

main()
    .catch((e) => {
        console.error('Error during test:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
