-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'EXPIRED', 'CANCELED');

-- CreateEnum
CREATE TYPE "PixProvider" AS ENUM ('ABACATEPAY', 'DELFINANCE');

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "amountInCents" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_charge_links" (
    "orderId" UUID NOT NULL,
    "chargeId" TEXT NOT NULL,
    "provider" "PixProvider" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_charge_links_pkey" PRIMARY KEY ("orderId")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_charge_links_provider_chargeId_key" ON "order_charge_links"("provider", "chargeId");

-- AddForeignKey
ALTER TABLE "order_charge_links" ADD CONSTRAINT "order_charge_links_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
