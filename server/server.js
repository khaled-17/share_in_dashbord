import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// مسار ملف البيانات
const DATA_FILE = path.join(__dirname, '../src/data/expense_types.json');

// Prisma initialization
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Get Reviews endpoint
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await prisma.customerReview.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Create Review endpoint
app.post('/api/reviews', async (req, res) => {
  try {
    const { name, role, review, rating, avatar, phoneNumber } = req.body;
    const newReview = await prisma.customerReview.create({
      data: {
        name,
        role,
        review,
        rating,
        avatar,
        phoneNumber
      }
    });
    res.json(newReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// قراءة البيانات
app.get('/api/expense-types', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).json({ error: 'Failed to read data' });
    }
    res.json(JSON.parse(data));
  });
});

// حفظ البيانات
app.post('/api/expense-types', (req, res) => {
  const newData = req.body;

  fs.writeFile(DATA_FILE, JSON.stringify(newData, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return res.status(500).json({ error: 'Failed to save data' });
    }
    res.json({ success: true, message: 'Data saved successfully' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
