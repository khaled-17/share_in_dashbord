import express from 'express';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import errorHandler from './middleware/errorMiddleware.js';

// Import Routes
import customerRoutes from './routes/customers.js';
import supplierRoutes from './routes/suppliers.js';
import financeRoutesRevenue from './routes/revenue.js';
import financeRoutesExpenses from './routes/expenses.js';
import settingsRoutes from './routes/settings.js';
import reviewRoutes from './routes/reviews.js';
import employeeRoutes from './routes/employees.js';
import shareenRoutes from './routes/shareen.js';
import quotationRoutes from './routes/quotations.js';
import workOrderRoutes from './routes/work_orders.js';
import partnerRoutes from './routes/partners.js';
import receiptVoucherRoutes from './routes/receiptVouchers.js';
import paymentVoucherRoutes from './routes/paymentVouchers.js';
import checkRoutes from './routes/checks.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Logging requests to console

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/revenue', financeRoutesRevenue);
app.use('/api/expenses', financeRoutesExpenses);
app.use('/api/settings', settingsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/shareen', shareenRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/receipt-vouchers', receiptVoucherRoutes);
app.use('/api/payment-vouchers', paymentVoucherRoutes);
app.use('/api/checks', checkRoutes);

// Global Error Handler (Must be last)
app.use(errorHandler);

export default app;
