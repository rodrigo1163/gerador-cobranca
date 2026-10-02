import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../../app.module';
import { PaymentService } from '../../../domain/orders/application/services/payment-service';
import { PrismaService } from '../../database/prisma/prisma.service';
import { FakePaymentService } from '../../../test/services/fake-payment-service';

describe('Generate order Pix (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let payment: FakePaymentService;

  beforeAll(async () => {
    payment = new FakePaymentService();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PaymentService)
      .useValue(payment)
      .compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('creates a Pix charge and persists its link to the order', async () => {
    const orderId = randomUUID();

    await prisma.order.create({
      data: { id: orderId, amountInCents: 1000 },
    });

    const response = await request(app.getHttpServer()).post(
      `/orders/${orderId}/pix`,
    );

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      pixCharge: {
        chargeId: `charge-${orderId}`,
        pixCopyPaste: `pix-${orderId}`,
        qrCodeDataUrl: `data:image/png;base64,qr-${orderId}`,
      },
    });
    expect(payment.calls).toEqual([{ orderId, amountInCents: 1000 }]);

    const link = await prisma.orderChargeLink.findUnique({
      where: { orderId },
    });

    expect(link).toMatchObject({
      orderId,
      chargeId: `charge-${orderId}`,
      provider: 'ABACATEPAY',
    });
  });

  it('returns 404 when the order does not exist', async () => {
    const response = await request(app.getHttpServer()).post(
      `/orders/${randomUUID()}/pix`,
    );

    expect(response.status).toBe(404);
    expect(payment.calls).toHaveLength(1);
  });
});
