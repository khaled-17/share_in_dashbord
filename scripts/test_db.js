import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing database connection...');
        const result = await prisma.customer.findFirst();
        console.log('Connection successful!');
        console.log('Sample customer:', result);
    } catch (error) {
        console.error('Database connection error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
