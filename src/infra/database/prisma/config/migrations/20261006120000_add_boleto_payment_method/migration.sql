ALTER TYPE "PixProvider" RENAME TO "PaymentProvider";

CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'BOLETO');

ALTER TABLE "order_charge_links"
ADD COLUMN "method" "PaymentMethod" NOT NULL DEFAULT 'PIX';

ALTER TABLE "order_charge_links"
DROP CONSTRAINT "order_charge_links_pkey";

ALTER TABLE "order_charge_links"
ADD CONSTRAINT "order_charge_links_pkey" PRIMARY KEY ("orderId", "method");

ALTER TABLE "order_charge_links"
ALTER COLUMN "method" DROP DEFAULT;
