import { makeOrder } from '../../../../test/factories/make-order';
import { InMemoryOrderChargeLinksRepository } from '../../../../test/repositories/in-memory-order-charge-links-repository';
import { InMemoryOrderRepository } from '../../../../test/repositories/in-memory-order-repository';
import { FakeBoletoGateway } from '../../../../test/services/fake-boleto-gateway';
import { InvalidBoletoChargeInputError } from '../errors/invalid-boleto-charge-input-error';
import { InvalidChargeAmountError } from '../errors/invalid-charge-amount-error';
import { OrderNotFoundError } from '../errors/order-not-found-error';
import { GenerateOrderBoletoUseCase } from './generate-order-boleto.use-case';

describe('Generate order boleto', () => {
  let ordersRepository: InMemoryOrderRepository;
  let chargeLinksRepository: InMemoryOrderChargeLinksRepository;
  let boletoGateway: FakeBoletoGateway;
  let sut: GenerateOrderBoletoUseCase;

  beforeEach(() => {
    ordersRepository = new InMemoryOrderRepository();
    chargeLinksRepository = new InMemoryOrderChargeLinksRepository();
    boletoGateway = new FakeBoletoGateway();
    sut = new GenerateOrderBoletoUseCase(
      ordersRepository,
      chargeLinksRepository,
      boletoGateway,
    );
  });

  it('generates and persists a boleto charge for an order', async () => {
    const order = makeOrder();
    await ordersRepository.create(order);

    const result = await sut.execute({
      orderId: order.id.toString(),
      dueDate: '2099-01-15',
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      boletoCharge: {
        chargeId: `boleto-${order.id.toString()}`,
        barcode: `barcode-${order.id.toString()}`,
        digitableLine: `digitable-${order.id.toString()}`,
        boletoUrl: `https://sandbox.asaas.com/b/${order.id.toString()}`,
        dueDate: '2099-01-15',
      },
    });
    expect(boletoGateway.calls).toEqual([
      {
        orderId: order.id.toString(),
        amountInCents: 1000,
        dueDate: '2099-01-15',
      },
    ]);
    expect(chargeLinksRepository.items[0]).toMatchObject({
      orderId: order.id.toString(),
      chargeId: `boleto-${order.id.toString()}`,
      provider: 'ASAAS',
      method: 'BOLETO',
    });
  });

  it('rejects an invalid due date before calling the gateway', async () => {
    const order = makeOrder();
    await ordersRepository.create(order);

    const result = await sut.execute({
      orderId: order.id.toString(),
      dueDate: '2027-02-31',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidBoletoChargeInputError);
    expect(boletoGateway.calls).toHaveLength(0);
  });

  it('rejects a past due date before calling the gateway', async () => {
    const order = makeOrder();
    await ordersRepository.create(order);

    const result = await sut.execute({
      orderId: order.id.toString(),
      dueDate: '2020-01-15',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidBoletoChargeInputError);
    expect(boletoGateway.calls).toHaveLength(0);
  });

  it('rejects a missing order before calling the gateway', async () => {
    const result = await sut.execute({
      orderId: 'missing-order',
      dueDate: '2099-01-15',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(OrderNotFoundError);
    expect(boletoGateway.calls).toHaveLength(0);
  });

  it('rejects an invalid amount before calling the gateway', async () => {
    const order = makeOrder({ amountInCents: 99 });
    await ordersRepository.create(order);

    const result = await sut.execute({
      orderId: order.id.toString(),
      dueDate: '2099-01-15',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidChargeAmountError);
    expect(boletoGateway.calls).toHaveLength(0);
    expect(chargeLinksRepository.items).toHaveLength(0);
  });
});
