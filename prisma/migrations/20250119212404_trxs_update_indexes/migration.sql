-- DropIndex
DROP INDEX "transactions_createdAt_idx";

-- DropIndex
DROP INDEX "transactions_paymentMethod_idx";

-- DropIndex
DROP INDEX "transactions_status_idx";

-- DropIndex
DROP INDEX "transactions_type_idx";

-- DropIndex
DROP INDEX "transactions_userId_idx";

-- CreateIndex
CREATE INDEX "transactions_hash_idx" ON "transactions"("hash");
