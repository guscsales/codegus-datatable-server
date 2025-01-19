import express from 'express';
import cors from 'cors';
import { PrismaClient, Prisma } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const port = 7543;

app.use(cors());
app.use(express.json());

interface QueryParams {
  page?: string;
  limit?: string;
  q?: string;
}

app.get('/api/transactions', async (req, res) => {
  try {
    const { page = '1', limit = '10', q = '' } = req.query as QueryParams;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const where: Prisma.TransactionWhereInput = q ? {
      OR: [
        { id: { equals: q } },
        { hash: { equals: q } },
        { user: { 
          OR: [
            { name: { contains: q, mode: 'insensitive' as Prisma.QueryMode } },
            { email: { contains: q } }
          ]
        }}
      ]
    } : {};

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        skip,
        take: limitNumber,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.transaction.count({ where })
    ]);

    const totalPages = Math.ceil(total / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPreviousPage = pageNumber > 1;

    res.json({
      items: transactions,
      metadata: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages,
        hasNextPage,
        hasPreviousPage
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
