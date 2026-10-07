import { BadRequestException } from '@nestjs/common';
import { GenerateOrderBoletoUseCase } from '../../../domain/orders/application/use-cases/generate-order-boleto.use-case';
import { makeOrder } from '../../../test/factories/make-order';
import { InMemoryOrderChargeLinksRepository } from '../../../test/repositories/in-memory-order-charge-links-repository';
import { InMemoryOrderRepository } from '../../../test/repositories/in-memory-order-repository';
import { FakeBoletoGateway } from '../../../test/services/fake-boleto-gateway';
import {
  boletoBodyValidationPipe,
  GenerateOrderBoletoController,
} from './generate-order-boleto.controller';

describe('Generate order boleto controller', () => {
  let controller: GenerateOrderBoletoController;
  let ordersRepository: InMemoryOrderRepository;
  let chargeLinksRepository: InMemoryOrderChargeLinksRepository;

  beforeEach(() => {
    ordersRepository = new InMemoryOrderRepository();
    chargeLinksRepository = new InMemoryOrderChargeLinksRepository();
    controller = new GenerateOrderBoletoController(
      new GenerateOrderBoletoUseCase(
        ordersRepository,
        chargeLinksRepository,
        new FakeBoletoGateway(),
      ),
    );
  });

  it('returns the normalized boleto response', async () => {
    const order = makeOrder();
    await ordersRepository.create(order);

    const result = await controller.handle(
      order.id.toString(),
      boletoBodyValidationPipe.transform({ dueDate: '2099-01-15' }),
    );

    expect(result).toEqual({
      boletoCharge: {
        chargeId: `boleto-${order.id.toString()}`,
        barcode: `barcode-${order.id.toString()}`,
        digitableLine: `digitable-${order.id.toString()}`,
        boletoUrl: `https://sandbox.asaas.com/b/${order.id.toString()}`,
        dueDate: '2099-01-15',
      },
    });
    expect(chargeLinksRepository.items[0]).toMatchObject({
      method: 'BOLETO',
      provider: 'ASAAS',
    });
  });

  it.each([
    {},
    { dueDate: '2099-1-15' },
    { dueDate: '2099-02-31' },
    { dueDate: 20270115 },
  ])('rejects an invalid boleto body: %j', (body) => {
    expect(() => boletoBodyValidationPipe.transform(body)).toThrow(
      BadRequestException,
    );
  });
});
