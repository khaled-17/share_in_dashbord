import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
    console.log('🌱 Starting database seeding...');

    try {
        // 1. إنشاء أنواع الإيرادات
        console.log('📊 Creating revenue types...');
        const revenueTypes = await Promise.all([
            prisma.revenueType.upsert({
                where: { revtype_id: 'REV001' },
                update: {},
                create: {
                    revtype_id: 'REV001',
                    revtype_name: 'دفعة عميل',
                    paymethod: 'cash'
                }
            }),
            prisma.revenueType.upsert({
                where: { revtype_id: 'REV002' },
                update: {},
                create: {
                    revtype_id: 'REV002',
                    revtype_name: 'دفعة مقدمة',
                    paymethod: 'cash'
                }
            })
        ]);

        // 2. إنشاء أنواع المصروفات
        console.log('💰 Creating expense types...');
        const expenseTypes = await Promise.all([
            prisma.expenseType.upsert({
                where: { exptype_id: 'EXP001' },
                update: {},
                create: {
                    exptype_id: 'EXP001',
                    exptype_name: 'إيجار',
                    category: 'مصاريف إدارية'
                }
            }),
            prisma.expenseType.upsert({
                where: { exptype_id: 'EXP002' },
                update: {},
                create: {
                    exptype_id: 'EXP002',
                    exptype_name: 'كهرباء ومياه',
                    category: 'مصاريف إدارية'
                }
            }),
            prisma.expenseType.upsert({
                where: { exptype_id: 'EXP003' },
                update: {},
                create: {
                    exptype_id: 'EXP003',
                    exptype_name: 'مشتريات',
                    category: 'مصاريف تشغيلية'
                }
            })
        ]);

        // 3. إنشاء أنواع المشاريع
        console.log('🏗️ Creating project types...');
        const projectTypes = await Promise.all([
            prisma.projectType.upsert({
                where: { type_id: 'PT001' },
                update: {},
                create: {
                    type_id: 'PT001',
                    type_name: 'مؤتمرات وفعاليات'
                }
            }),
            prisma.projectType.upsert({
                where: { type_id: 'PT002' },
                update: {},
                create: {
                    type_id: 'PT002',
                    type_name: 'حفلات وأفراح'
                }
            }),
            prisma.projectType.upsert({
                where: { type_id: 'PT003' },
                update: {},
                create: {
                    type_id: 'PT003',
                    type_name: 'معارض'
                }
            })
        ]);

        // 4. إنشاء عملاء تجريبيين
        console.log('👥 Creating customers...');
        const customers = await Promise.all([
            prisma.customer.upsert({
                where: { customer_id: 'C00001' },
                update: {},
                create: {
                    customer_id: 'C00001',
                    name: 'شركة النور للتجارة',
                    contact_person: 'أحمد محمد',
                    company_email: 'info@alnoor.com',
                    contact_email: 'ahmed@alnoor.com',
                    phone: '01012345678',
                    secondary_phone: '01123456789',
                    address: 'القاهرة - مصر الجديدة'
                }
            }),
            prisma.customer.upsert({
                where: { customer_id: 'C00002' },
                update: {},
                create: {
                    customer_id: 'C00002',
                    name: 'مؤسسة الأمل',
                    contact_person: 'محمد علي',
                    company_email: 'contact@alamal.com',
                    phone: '01098765432',
                    address: 'الجيزة - المهندسين'
                }
            }),
            prisma.customer.upsert({
                where: { customer_id: 'C00003' },
                update: {},
                create: {
                    customer_id: 'C00003',
                    name: 'شركة المستقبل للتطوير',
                    contact_person: 'سارة أحمد',
                    company_email: 'info@future-dev.com',
                    phone: '01156789012',
                    address: 'الإسكندرية - سموحة'
                }
            })
        ]);

        // 5. إنشاء موردين تجريبيين
        console.log('🏪 Creating suppliers...');
        const suppliers = await Promise.all([
            prisma.supplier.upsert({
                where: { supplier_id: 'S001' },
                update: {},
                create: {
                    supplier_id: 'S001',
                    name: 'المصرية للإضاءة',
                    contact_person: 'خالد حسن',
                    email: 'sales@lighting.com',
                    phone: '01278889900',
                    speciality: 'إضاءة – ليزر',
                    address: 'القاهرة - شبرا'
                }
            }),
            prisma.supplier.upsert({
                where: { supplier_id: 'S002' },
                update: {},
                create: {
                    supplier_id: 'S002',
                    name: 'ترانس سبيشال',
                    contact_person: 'عمر فتحي',
                    email: 'info@trans-special.com',
                    phone: '01189990011',
                    speciality: 'نقل – لوجستيات',
                    address: 'الجيزة - فيصل'
                }
            }),
            prisma.supplier.upsert({
                where: { supplier_id: 'S003' },
                update: {},
                create: {
                    supplier_id: 'S003',
                    name: 'صوت وصورة بلس',
                    phone: '01090001122',
                    speciality: 'شاشات – فيديو ميكسر',
                    address: 'القاهرة - مدينة نصر'
                }
            }),
            prisma.supplier.upsert({
                where: { supplier_id: 'S004' },
                update: {},
                create: {
                    supplier_id: 'S004',
                    name: 'بالونات كيدز',
                    phone: '01201112233',
                    speciality: 'بالون – ديكور',
                    address: 'الجيزة - الهرم'
                }
            })
        ]);

        // 6. إنشاء موظفين تجريبيين
        console.log('👨‍💼 Creating employees...');
        const employees = await Promise.all([
            prisma.employee.upsert({
                where: { emp_code: 'EMP001' },
                update: {},
                create: {
                    emp_code: 'EMP001',
                    name: 'محمد أحمد',
                    phone: '01012345678',
                    position: 'مدير مشاريع',
                    salary: 8000,
                    start_date: '2024-01-01'
                }
            }),
            prisma.employee.upsert({
                where: { emp_code: 'EMP002' },
                update: {},
                create: {
                    emp_code: 'EMP002',
                    name: 'فاطمة علي',
                    phone: '01098765432',
                    position: 'محاسب',
                    salary: 6000,
                    start_date: '2024-02-01'
                }
            }),
            prisma.employee.upsert({
                where: { emp_code: 'EMP003' },
                update: {},
                create: {
                    emp_code: 'EMP003',
                    name: 'أحمد حسن',
                    phone: '01156789012',
                    position: 'فني صوت وإضاءة',
                    salary: 5000,
                    start_date: '2024-03-01'
                }
            })
        ]);

        // 7. إنشاء شركاء تجريبيين
        console.log('🤝 Creating partners...');
        const partners = await Promise.all([
            prisma.partner.upsert({
                where: { partner_code: 'P001' },
                update: {},
                create: {
                    partner_code: 'P001',
                    name: 'أحمد محمود',
                    phone: '01012345678',
                    email: 'ahmed.mahmoud@example.com',
                    initial_capital: 100000,
                    current_capital: 100000
                }
            }),
            prisma.partner.upsert({
                where: { partner_code: 'P002' },
                update: {},
                create: {
                    partner_code: 'P002',
                    name: 'محمد سعيد',
                    phone: '01098765432',
                    email: 'mohamed.saeed@example.com',
                    initial_capital: 150000,
                    current_capital: 150000
                }
            })
        ]);

        console.log('✅ Database seeding completed successfully!');
        console.log(`
📊 Summary:
- Revenue Types: ${revenueTypes.length}
- Expense Types: ${expenseTypes.length}
- Project Types: ${projectTypes.length}
- Customers: ${customers.length}
- Suppliers: ${suppliers.length}
- Employees: ${employees.length}
- Partners: ${partners.length}
    `);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
