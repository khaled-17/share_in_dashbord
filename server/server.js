import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
