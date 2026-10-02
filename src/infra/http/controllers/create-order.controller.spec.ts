import { BadRequestException } from '@nestjs/common';
import { CreateOrderUseCase } from '../../../domain/orders/application/use-cases/create-order.use-case';
import { InMemoryOrderRepository } from '../../../test/repositories/in-memory-order-repository';
import { CreateOrderController } from './create-order.controller';

describe('Create order controller', () => {
  let controller: CreateOrderController;
  let ordersRepository: InMemoryOrderRepository;

  beforeEach(() => {
    ordersRepository = new InMemoryOrderRepository();
    controller = new CreateOrderController(
      new CreateOrderUseCase(ordersRepository),
    );
  });

  it('returns the persisted order', async () => {
    const result = await controller.handle({ amountInCents: 1500 });

    expect(result.order.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(result.order.amountInCents).toBe(1500);
    expect(result.order.status).toBe('PENDING_PAYMENT');
    expect(await ordersRepository.findById(result.order.id)).not.toBeNull();
  });

  it.each([
    {},
    { amountInCents: 0 },
    { amountInCents: -100 },
    { amountInCents: 10.5 },
    { amountInCents: '1000' },
    { amountInCents: 2_147_483_648 },
  ])('rejects an invalid amount: %j', async (body) => {
    await expect(
      controller.handle(body as { amountInCents?: number }),
    ).rejects.toThrow(BadRequestException);
    expect(ordersRepository.items).toHaveLength(0);
  });
});
