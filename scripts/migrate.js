import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

const OLD_SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const OLD_SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const OLD_DATABASE_URL = process.env.OLD_DATABASE_URL;

console.log('🔄 Connecting to NEW Database via Prisma...');
const newDb = new PrismaClient();

async function migrate() {
    let oldPgClient = null;
    let oldSupabaseClient = null;

    try {
        // Determine connection method for OLD DB
        if (OLD_DATABASE_URL) {
            console.log('🔌 Found OLD_DATABASE_URL, using PostgreSQL connection...');
            oldPgClient = new Client({ connectionString: OLD_DATABASE_URL });
            await oldPgClient.connect();
        } else if (OLD_SUPABASE_URL && OLD_SUPABASE_KEY) {
            console.log('🔌 Found VITE_SUPABASE_URL, using Supabase API...');
            oldSupabaseClient = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_KEY);
        } else {
            throw new Error('❌ No credentials found for OLD Database. Please set OLD_DATABASE_URL or (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY) in .env');
        }

        // Helper to fetch data
        const fetchData = async (table) => {
            if (oldPgClient) {
                const res = await oldPgClient.query(`SELECT * FROM ${table}`);
                return res.rows;
            } else {
                const { data, error } = await oldSupabaseClient.from(table).select('*');
                if (error) throw error;
                return data;
            }
        };

        // 1. Migrate Customers
        console.log('📦 Migrating Customers...');
        const customers = await fetchData('customers');

        if (customers && customers.length > 0) {
            await newDb.customer.createMany({
                data: customers.map(c => ({
                    customer_id: c.customer_id,
                    name: c.name,
                    phone: c.phone,
                    address: c.address
                })),
                skipDuplicates: true
            });
            console.log(`✅ Migrated ${customers.length} customers.`);
        }

        // 2. Migrate Suppliers
        console.log('📦 Migrating Suppliers...');
        const suppliers = await fetchData('suppliers');

        if (suppliers && suppliers.length > 0) {
            await newDb.supplier.createMany({
                data: suppliers.map(s => ({
                    id: s.id,
                    supplier_id: s.supplier_id,
                    name: s.name,
                    phone: s.phone,
                    speciality: s.speciality
                })),
                skipDuplicates: true
            });
            console.log(`✅ Migrated ${suppliers.length} suppliers.`);
        }

        // 3. Migrate Expense Types
        console.log('📦 Migrating Expense Types...');
        const expTypes = await fetchData('expense_types');

        if (expTypes && expTypes.length > 0) {
            await newDb.expenseType.createMany({
                data: expTypes.map(e => ({
                    id: e.id,
                    exptype_id: e.exptype_id,
                    exptype_name: e.exptype_name,
                    category: e.category
                })),
                skipDuplicates: true
            });
            console.log(`✅ Migrated ${expTypes.length} expense types.`);
        }

        // 4. Migrate Revenue Types
        console.log('📦 Migrating Revenue Types...');
        const revTypes = await fetchData('revenue_types');

        if (revTypes && revTypes.length > 0) {
            await newDb.revenueType.createMany({
                data: revTypes.map(r => ({
                    id: r.id,
                    revtype_id: r.revtype_id,
                    revtype_name: r.revtype_name,
                    paymethod: r.paymethod
                })),
                skipDuplicates: true
            });
            console.log(`✅ Migrated ${revTypes.length} revenue types.`);
        }

        // 5. Migrate Revenue
        console.log('📦 Migrating Revenue...');
        const revenues = await fetchData('revenue');

        if (revenues && revenues.length > 0) {
            await newDb.revenue.createMany({
                data: revenues.map(r => ({
                    id: r.id,
                    rev_date: r.rev_date,
                    amount: typeof r.amount === 'string' ? parseFloat(r.amount) : r.amount,
                    receipt_no: r.receipt_no,
                    quote_id: r.quote_id,
                    notes: r.notes,
                    customer_id: r.customer_id,
                    revtype_id: r.revtype_id
                })),
                skipDuplicates: true
            });
            console.log(`✅ Migrated ${revenues.length} revenue records.`);
        }

        // 6. Migrate Expenses
        console.log('📦 Migrating Expenses...');
        const expenses = await fetchData('expenses');

        if (expenses && expenses.length > 0) {
            await newDb.expense.createMany({
                data: expenses.map(e => ({
                    id: e.id,
                    exp_date: e.exp_date,
                    amount: typeof e.amount === 'string' ? parseFloat(e.amount) : e.amount,
                    receipt_no: e.receipt_no,
                    quote_id: e.quote_id,
                    notes: e.notes,
                    supplier_id: e.supplier_id,
                    exptype_id: e.exptype_id
                })),
                skipDuplicates: true
            });
            console.log(`✅ Migrated ${expenses.length} expense records.`);
        }

        console.log('🎉 Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        if (oldPgClient) await oldPgClient.end();
        await newDb.$disconnect();
    }
}

migrate();
