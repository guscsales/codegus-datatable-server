import express from "express";
import cors from "cors";
import {PrismaClient, Prisma, TransactionType} from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const port = 7543;

app.use(cors());
app.use(express.json());

interface QueryParams {
  page?: string;
  limit?: string;
  q?: string;
  type?: TransactionType;
  sortField?: string;
  sortDirection?: Prisma.SortOrder;
}

app.get("/api/transactions", async (req, res) => {
  try {
    const {
      page = "1",
      limit = "10",
      q = "",
      type = "",
      sortField = "createdAt",
      sortDirection = "desc",
    } = req.query as QueryParams;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    let where: Prisma.TransactionWhereInput = {};

    if (q) {
      where = {
        OR: [
          {id: {equals: q}},
          {
            user: {
              OR: [{email: {contains: q, mode: "insensitive"}}],
            },
          },
        ],
      };
    }

    if (type) {
      where = {
        ...where,
        AND: {
          type,
        },
      };
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        select: {
          id: true,
          currency: true,
          netAmount: true,
          totalAmount: true,
          installments: true,
          paymentMethod: true,
          status: true,
          type: true,
          createdAt: true,
          processedAt: true,
          confirmedAt: true,
          failedAt: true,
          refundedAt: true,
          cancelledAt: true,
          user: {
            select: {
              email: true,
            },
          },
        },
        where,
        skip,
        take: limitNumber,
        orderBy:
          sortField === "userEmail"
            ? {
                user: {
                  email: sortDirection,
                },
              }
            : {createdAt: sortDirection},
      }),
      prisma.transaction.count({where}),
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
        hasPreviousPage,
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({error: "Internal server error"});
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
