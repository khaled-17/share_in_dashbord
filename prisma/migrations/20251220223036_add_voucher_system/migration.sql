-- CreateTable
CREATE TABLE "CustomerReview" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "review" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "avatar" TEXT,
    "phoneNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue_types" (
    "id" SERIAL NOT NULL,
    "revtype_id" TEXT NOT NULL,
    "revtype_name" TEXT NOT NULL,
    "paymethod" TEXT NOT NULL DEFAULT 'cash',

    CONSTRAINT "revenue_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue" (
    "id" SERIAL NOT NULL,
    "rev_date" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "receipt_no" TEXT,
    "quote_id" INTEGER,
    "notes" TEXT,
    "customer_id" TEXT NOT NULL,
    "revtype_id" TEXT NOT NULL,

    CONSTRAINT "revenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" SERIAL NOT NULL,
    "exp_date" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "receipt_no" TEXT,
    "quote_id" INTEGER,
    "notes" TEXT,
    "supplier_id" TEXT NOT NULL,
    "exptype_id" TEXT NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shareen" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shareen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_types" (
    "id" SERIAL NOT NULL,
    "type_id" TEXT NOT NULL,
    "type_name" TEXT NOT NULL,

    CONSTRAINT "project_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotations" (
    "id" SERIAL NOT NULL,
    "customer_id" TEXT NOT NULL,
    "project_type_id" TEXT,
    "project_manager" TEXT,
    "project_name" TEXT,
    "quote_date" TEXT NOT NULL,
    "delivery_date" TEXT,
    "totalamount" DOUBLE PRECISION NOT NULL,
    "paid_adv" DOUBLE PRECISION,
    "adv_date" TEXT,
    "receipt_no" TEXT,
    "status" TEXT NOT NULL DEFAULT 'مسودة',

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_items" (
    "id" SERIAL NOT NULL,
    "quotation_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "quotation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" SERIAL NOT NULL,
    "order_code" TEXT NOT NULL,
    "quotation_id" INTEGER NOT NULL,
    "customer_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" SERIAL NOT NULL,
    "partner_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "initial_capital" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "current_capital" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipt_vouchers" (
    "id" SERIAL NOT NULL,
    "voucher_number" TEXT NOT NULL,
    "voucher_date" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "source_type" TEXT NOT NULL,
    "customer_id" TEXT,
    "partner_id" INTEGER,
    "payment_method" TEXT NOT NULL,
    "check_id" INTEGER,
    "description" TEXT,
    "received_from" TEXT NOT NULL,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receipt_vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_vouchers" (
    "id" SERIAL NOT NULL,
    "voucher_number" TEXT NOT NULL,
    "voucher_date" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "beneficiary_type" TEXT NOT NULL,
    "supplier_id" TEXT,
    "employee_id" TEXT,
    "partner_id" INTEGER,
    "expense_type_id" TEXT,
    "payment_method" TEXT NOT NULL,
    "check_id" INTEGER,
    "description" TEXT,
    "paid_to" TEXT NOT NULL,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "check_details" (
    "id" SERIAL NOT NULL,
    "check_number" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "check_date" TEXT NOT NULL,
    "beneficiary_name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receipt_voucher_id" INTEGER,
    "payment_voucher_id" INTEGER,

    CONSTRAINT "check_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" SERIAL NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact_person" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "secondary_phone" TEXT,
    "address" TEXT,
    "speciality" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" SERIAL NOT NULL,
    "emp_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "position" TEXT,
    "salary" DOUBLE PRECISION,
    "start_date" TEXT,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_types" (
    "id" SERIAL NOT NULL,
    "exptype_id" TEXT NOT NULL,
    "exptype_name" TEXT NOT NULL,
    "category" TEXT,

    CONSTRAINT "expense_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "customer_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact_person" TEXT,
    "company_email" TEXT,
    "contact_email" TEXT,
    "phone" TEXT,
    "secondary_phone" TEXT,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("customer_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "revenue_types_revtype_id_key" ON "revenue_types"("revtype_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_types_type_id_key" ON "project_types"("type_id");

-- CreateIndex
CREATE UNIQUE INDEX "WorkOrder_order_code_key" ON "WorkOrder"("order_code");

-- CreateIndex
CREATE UNIQUE INDEX "partners_partner_code_key" ON "partners"("partner_code");

-- CreateIndex
CREATE UNIQUE INDEX "receipt_vouchers_voucher_number_key" ON "receipt_vouchers"("voucher_number");

-- CreateIndex
CREATE UNIQUE INDEX "receipt_vouchers_check_id_key" ON "receipt_vouchers"("check_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_vouchers_voucher_number_key" ON "payment_vouchers"("voucher_number");

-- CreateIndex
CREATE UNIQUE INDEX "payment_vouchers_check_id_key" ON "payment_vouchers"("check_id");

-- CreateIndex
CREATE UNIQUE INDEX "check_details_receipt_voucher_id_key" ON "check_details"("receipt_voucher_id");

-- CreateIndex
CREATE UNIQUE INDEX "check_details_payment_voucher_id_key" ON "check_details"("payment_voucher_id");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_supplier_id_key" ON "suppliers"("supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "employees_emp_code_key" ON "employees"("emp_code");

-- CreateIndex
CREATE UNIQUE INDEX "expense_types_exptype_id_key" ON "expense_types"("exptype_id");

-- AddForeignKey
ALTER TABLE "revenue" ADD CONSTRAINT "revenue_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue" ADD CONSTRAINT "revenue_revtype_id_fkey" FOREIGN KEY ("revtype_id") REFERENCES "revenue_types"("revtype_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("supplier_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_exptype_id_fkey" FOREIGN KEY ("exptype_id") REFERENCES "expense_types"("exptype_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_project_type_id_fkey" FOREIGN KEY ("project_type_id") REFERENCES "project_types"("type_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_vouchers" ADD CONSTRAINT "receipt_vouchers_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_vouchers" ADD CONSTRAINT "receipt_vouchers_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_vouchers" ADD CONSTRAINT "payment_vouchers_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("supplier_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_vouchers" ADD CONSTRAINT "payment_vouchers_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("emp_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_vouchers" ADD CONSTRAINT "payment_vouchers_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_vouchers" ADD CONSTRAINT "payment_vouchers_expense_type_id_fkey" FOREIGN KEY ("expense_type_id") REFERENCES "expense_types"("exptype_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_details" ADD CONSTRAINT "check_details_receipt_voucher_id_fkey" FOREIGN KEY ("receipt_voucher_id") REFERENCES "receipt_vouchers"("check_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_details" ADD CONSTRAINT "check_details_payment_voucher_id_fkey" FOREIGN KEY ("payment_voucher_id") REFERENCES "payment_vouchers"("check_id") ON DELETE SET NULL ON UPDATE CASCADE;
