import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all quotations
router.get('/', async (req, res) => {
    try {
        const quotations = await prisma.quotation.findMany({
            orderBy: { quote_date: 'desc' },
            include: {
                customer: true,
                items: true
            }
        });
        res.json(quotations);
    } catch (error) {
        console.error('Error fetching quotations:', error);
        res.status(500).json({ error: 'Failed to fetch quotations' });
    }
});

// Get single quotation
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const idInt = parseInt(id);
        const quotation = await prisma.quotation.findUnique({
            where: { id: idInt },
            include: {
                customer: true,
                items: true
            }
        });
        if (!quotation) {
            return res.status(404).json({ error: 'Quotation not found' });
        }
        res.json(quotation);
    } catch (error) {
        console.error('Error fetching quotation:', error);
        res.status(500).json({ error: 'Failed to fetch quotation' });
    }
});

// Create new quotation
router.post('/', async (req, res) => {
    try {
        const {
            customer_id,
            project_type,
            project_manager,
            project_name,
            quote_date,
            delivery_date,
            totalamount,
            paid_adv,
            adv_date,
            receipt_no,
            status,
            items // Array of { description, unit_price, quantity, total }
        } = req.body;

        const newQuotation = await prisma.quotation.create({
            data: {
                customer_id,
                project_type,
                project_manager,
                project_name,
                quote_date,
                delivery_date,
                totalamount: parseFloat(totalamount),
                paid_adv: paid_adv ? parseFloat(paid_adv) : null,
                adv_date,
                receipt_no,
                status: status || 'مسودة',
                items: {
                    create: items || []
                }
            },
            include: {
                customer: true,
                items: true
            }
        });
        res.json(newQuotation);
    } catch (error) {
        console.error('Error creating quotation:', error);
        res.status(500).json({ error: 'Failed to create quotation' });
    }
});

// Update quotation
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            customer_id,
            project_type,
            project_manager,
            project_name,
            quote_date,
            delivery_date,
            totalamount,
            paid_adv,
            adv_date,
            receipt_no,
            status,
            items
        } = req.body;
        const idInt = parseInt(id);

        // Delete existing items first for a simple replace approach
        await prisma.quotationItem.deleteMany({
            where: { quotation_id: idInt }
        });

        const updatedQuotation = await prisma.quotation.update({
            where: { id: idInt },
            data: {
                customer_id,
                project_type,
                project_manager,
                project_name,
                quote_date,
                delivery_date,
                totalamount: parseFloat(totalamount),
                paid_adv: paid_adv ? parseFloat(paid_adv) : null,
                adv_date,
                receipt_no,
                status,
                items: {
                    create: items || []
                }
            },
            include: {
                customer: true,
                items: true
            }
        });
        res.json(updatedQuotation);
    } catch (error) {
        console.error('Error updating quotation:', error);
        res.status(500).json({ error: 'Failed to update quotation' });
    }
});

// Delete quotation
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const idInt = parseInt(id);

        await prisma.quotation.delete({
            where: { id: idInt }
        });
        res.json({ message: 'Quotation deleted successfully' });
    } catch (error) {
        console.error('Error deleting quotation:', error);
        res.status(500).json({ error: 'Failed to delete quotation' });
    }
});

export default router;
