import express from 'express';
import prisma from '../prisma.js';

const router = express.Router();

// Get all employees
router.get('/', async (req, res) => {
    try {
        const employees = await prisma.employee.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

// Create new employee
router.post('/', async (req, res) => {
    try {
        const { emp_code, name, phone, position, salary, start_date } = req.body;

        const newEmployee = await prisma.employee.create({
            data: {
                emp_code,
                name,
                phone,
                position,
                salary,
                start_date
            }
        });
        res.json(newEmployee);
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({ error: 'Failed to create employee' });
    }
});

// Update employee
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { emp_code, name, phone, position, salary, start_date } = req.body;
        const idInt = parseInt(id);

        const updatedEmployee = await prisma.employee.update({
            where: { id: idInt },
            data: {
                emp_code,
                name,
                phone,
                position,
                salary,
                start_date
            }
        });
        res.json(updatedEmployee);
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ error: 'Failed to update employee' });
    }
});

// Delete employee
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const idInt = parseInt(id);

        await prisma.employee.delete({
            where: { id: idInt }
        });
        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ error: 'Failed to delete employee' });
    }
});

export default router;
