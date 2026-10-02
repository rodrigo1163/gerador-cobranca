import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '../repositories/orders-repository';
import { Order } from '../../enterprise/entities/order';
import { InvalidChargeAmountError } from '../errors/invalid-charge-amount-error';

interface CreateOrderUseCaseRequest {
  amountInCents: number;
}

@Injectable()
export class CreateOrderUseCase {
  constructor(private ordersRepository: OrdersRepository) { }

  async execute({ amountInCents }: CreateOrderUseCaseRequest) {
    const order = Order.create({ amountInCents });

    if (!order.isValidAmount()) {
      throw new InvalidChargeAmountError();
    }

    await this.ordersRepository.create(order);

    return { order };
  }
}
