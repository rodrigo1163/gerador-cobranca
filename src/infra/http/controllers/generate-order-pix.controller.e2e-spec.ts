import { randomUUID } from 'node:crypto';
import type { INestApplication, Type } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import request from 'supertest';
import { AppModule } from '../../../app.module';
import type { CreatePixChargeResponse } from '../../../domain/orders/application/services/payment-service';
import { PaymentService } from '../../../domain/orders/application/services/payment-service';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AbacatePayPaymentService } from '../../payments/abacate-pay/abacate-pay-payment.service';
import { AsaasClient } from '../../payments/asaas/asaas-client';
import { AsaasPaymentService } from '../../payments/asaas/asaas-payment.service';

interface AsaasCustomer {
  id: string;
}

interface AsaasCustomerList {
  data: AsaasCustomer[];
}

const customerExternalReference = 'gerador-cobranca-e2e';
const amountInCents = 1000;

describe('Generate order Pix with real gateways (E2E)', () => {
  const apps: INestApplication[] = [];
  let abacateApp: INestApplication;
  let asaasApp: INestApplication;
  let prisma: PrismaService;
  let asaasCustomerId: string;

  async function createApp(paymentService: Type<PaymentService>) {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PaymentService)
      .useClass(paymentService)
      .compile();

    const app = moduleRef.createNestApplication();
    apps.push(app);
    await app.init();

    return { app, prisma: moduleRef.get(PrismaService) };
  }

  beforeAll(async () => {
    if (!process.env.ABACATEPAY_API_KEY?.startsWith('abc_dev_')) {
      throw new Error('E2E requires an AbacatePay development API key.');
    }

    const asaasBaseUrl = new URL(
      process.env.ASAAS_BASE_URL ?? 'https://api-sandbox.asaas.com/v3',
    );
    if (asaasBaseUrl.hostname !== 'api-sandbox.asaas.com') {
      throw new Error('E2E requires the Asaas sandbox URL.');
    }

    const asaasClient = new AsaasClient();
    const customers = await asaasClient.get<AsaasCustomerList>(
      `/customers?externalReference=${encodeURIComponent(customerExternalReference)}`,
    );

    if (!Array.isArray(customers.data)) {
      throw new Error('Invalid Asaas customer list response.');
    }

    let customer = customers.data[0];
    if (!customer) {
      customer = await asaasClient.post<AsaasCustomer>('/customers', {
        name: 'Teste E2E Gerador Cobranca',
        cpfCnpj: '24971563792',
        externalReference: customerExternalReference,
        notificationDisabled: true,
      });
    }

    if (typeof customer.id !== 'string' || !customer.id.trim()) {
      throw new Error('Asaas did not return a customer ID.');
    }
    asaasCustomerId = customer.id;

    const abacate = await createApp(AbacatePayPaymentService);
    abacateApp = abacate.app;
    prisma = abacate.prisma;

    const previousCustomerId = process.env.ASAAS_CUSTOMER_ID;
    process.env.ASAAS_CUSTOMER_ID = asaasCustomerId;

    try {
      asaasApp = (await createApp(AsaasPaymentService)).app;
    } finally {
      if (previousCustomerId === undefined) {
        delete process.env.ASAAS_CUSTOMER_ID;
      } else {
        process.env.ASAAS_CUSTOMER_ID = previousCustomerId;
      }
    }
  });

  afterAll(async () => {
    await Promise.all(apps.map((app) => app.close()));
  });

  it('returns the same Pix contract and persists each gateway charge', async () => {
    const charges: CreatePixChargeResponse[] = [];

    for (const { app, provider } of [
      { app: asaasApp, provider: 'ASAAS' },
      { app: abacateApp, provider: 'ABACATEPAY' },
    ] as const) {
      const orderId = randomUUID();
      await prisma.order.create({
        data: { id: orderId, amountInCents },
      });

      const response = await request(app.getHttpServer())
        .post(`/orders/${orderId}/pix`)
        .send({});

      expect(
        response.status,
        `${provider}: ${JSON.stringify(response.body)}`,
      ).toBe(201);
      expect(Object.keys(response.body)).toEqual(['pixCharge']);

      const pixCharge = response.body.pixCharge as CreatePixChargeResponse;
      expect(Object.keys(pixCharge).sort()).toEqual([
        'chargeId',
        'pixCopyPaste',
        'qrCodeDataUrl',
      ]);
      expect(pixCharge.chargeId.trim()).not.toBe('');
      expect(pixCharge.pixCopyPaste.trim()).not.toBe('');
      const pngDataUrl = /^data:image\/png;base64,([A-Za-z0-9+/]+={0,2})$/.exec(
        pixCharge.qrCodeDataUrl,
      );
      expect(
        pngDataUrl,
        `${provider}: expected a base64 PNG data URL`,
      ).not.toBeNull();

      const pngBytes = Buffer.from(pngDataUrl![1], 'base64');
      const png = PNG.sync.read(pngBytes, {
        checkCRC: true,
      });
      expect(png.data).toHaveLength(png.width * png.height * 4);

      const decodedQr = jsQR(
        new Uint8ClampedArray(png.data!),
        png.width,
        png.height,
      );
      expect(
        decodedQr,
        `${provider}: PNG does not contain a readable QR code`,
      ).not.toBeNull();
      expect(
        decodedQr?.data,
        `${provider}: QR code differs from copy-and-paste`,
      ).toBe(pixCharge.pixCopyPaste);

      const link = await prisma.orderChargeLink.findUnique({
        where: { orderId },
      });
      expect(link).toMatchObject({
        orderId,
        chargeId: pixCharge.chargeId,
        provider,
      });

      charges.push(pixCharge);
    }

    expect(charges).toHaveLength(2);
    expect(Object.keys(charges[0]).sort()).toEqual(
      Object.keys(charges[1]).sort(),
    );
  });

  it('returns 404 for an order that does not exist with either gateway', async () => {
    for (const app of [abacateApp, asaasApp]) {
      const response = await request(app.getHttpServer()).post(
        `/orders/${randomUUID()}/pix`,
      );

      expect(response.status).toBe(404);
    }
  });
});
