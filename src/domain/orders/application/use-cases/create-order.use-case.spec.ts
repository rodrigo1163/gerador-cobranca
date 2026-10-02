import { InMemoryOrderRepository } from '../../../../test/repositories/in-memory-order-repository';
import { InvalidChargeAmountError } from '../errors/invalid-charge-amount-error';
import { CreateOrderUseCase } from './create-order.use-case';

describe('Create order', () => {
  it('persists a pending order with the requested amount', async () => {
    const ordersRepository = new InMemoryOrderRepository();
    const useCase = new CreateOrderUseCase(ordersRepository);

    const { order } = await useCase.execute({ amountInCents: 1500 });

    expect(order.amountInCents).toBe(1500);
    expect(order.status).toBe('PENDING_PAYMENT');
    expect(await ordersRepository.findById(order.id.toString())).toBe(order);
  });

  it('rejects a charge amount below 100 cents', async () => {
    const ordersRepository = new InMemoryOrderRepository();
    const useCase = new CreateOrderUseCase(ordersRepository);

    await expect(useCase.execute({ amountInCents: 99 })).rejects.toThrow(
      InvalidChargeAmountError,
    );
    expect(ordersRepository.items).toHaveLength(0);
  });
});
