import {PrismaClient} from "@prisma/client";
import {faker} from "@faker-js/faker";

const USERS_COUNT = 50000;
const TRANSACTIONS_COUNT = 1000000;
const BATCH_SIZE = 10000;

(async () => {
  console.log("🌱 Starting database seed...");
  const prisma = new PrismaClient();

  try {
    // Create users
    console.log(`Creating ${USERS_COUNT} users...`);
    let batches = Math.ceil(USERS_COUNT / BATCH_SIZE);

    console.log(
      `Creating ${USERS_COUNT} common users in ${batches} batches...`
    );

    for (let i = 0; i < batches; i++) {
      const batchSize = Math.min(BATCH_SIZE, USERS_COUNT - i * BATCH_SIZE);
      const users = Array.from({length: batchSize}, () => ({
        email: faker.internet.email(),
        name: faker.person.fullName(),
      }));

      await prisma.user.createMany({
        data: users,
        skipDuplicates: true,
      });

      console.log(
        `✅ Batch ${i + 1}/${batches} completed (${batchSize} users)`
      );
    }

    // Create transactions
    console.log(`Creating ${TRANSACTIONS_COUNT} transactions...`);
    batches = Math.ceil(TRANSACTIONS_COUNT / BATCH_SIZE);

    console.log(
      `Creating ${TRANSACTIONS_COUNT} transactions in ${batches} batches...`
    );

    const users = await prisma.user.findMany({
      select: {id: true},
    });
    const usersIds = users.map((user) => user.id);

    for (let i = 0; i < batches; i++) {
      const batchSize = Math.min(
        BATCH_SIZE,
        TRANSACTIONS_COUNT - i * BATCH_SIZE
      );
      const status = faker.helpers.arrayElement([
        "PENDING",
        "COMPLETED",
        "FAILED",
        "REFUNDED",
        "CANCELLED",
      ]);
      const transactions = Array.from({length: batchSize}, () => ({
        userId: faker.helpers.arrayElement(usersIds),
        hash: faker.string.alphanumeric({length: 32}),
        status,
        type: faker.helpers.arrayElement([
          "CREDIT",
          "DEBIT",
          "TRANSFER",
          "PAYMENT",
        ]),
        currency: "BRL",
        trackingCode: faker.string.alphanumeric({length: 16}),
        externalId: faker.string.uuid(),
        processedAt: faker.date.past(),
        confirmedAt: status === "COMPLETED" ? faker.date.past() : null,
        failedAt: status === "FAILED" ? faker.date.past() : null,
        refundedAt: status === "REFUNDED" ? faker.date.past() : null,
        cancelledAt: status === "CANCELLED" ? faker.date.past() : null,
        paymentMethod: faker.helpers.arrayElement([
          "CREDIT_CARD",
          "PIX",
          "BOLETO",
          "PAYPAL",
          "OTHER",
        ]),
        paymentDetails: {
          cardLastFour: faker.finance.creditCardNumber("####"),
          cardBrand: faker.helpers.arrayElement(["visa", "mastercard", "amex"]),
        },
        installments: faker.number.int({min: 1, max: 12}),
        fee: faker.number.float({min: 1, max: 100, fractionDigits: 2}),
        netAmount: faker.number.float({
          min: 100,
          max: 10000,
          fractionDigits: 2,
        }),
        totalAmount: faker.number.float({
          min: 100,
          max: 10000,
          fractionDigits: 2,
        }),
        tags: faker.helpers.arrayElements(
          ["promo", "special", "seasonal", "discount"],
          {min: 1, max: 3}
        ),
        ipAddress: faker.internet.ip(),
        retryCount: faker.number.int({min: 0, max: 5}),
        createdAt: faker.date.past(),
      }));

      await prisma.transaction.createMany({
        data: transactions,
        skipDuplicates: true,
      });
      console.log(
        `✅ Batch ${i + 1}/${batches} completed (${batchSize} transactions)`
      );
    }

    console.log("🎉 Database seed completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
