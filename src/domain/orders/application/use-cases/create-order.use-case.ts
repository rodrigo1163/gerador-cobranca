import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '../repositories/orders-repository';
import { Order } from '../../enterprise/entities/order';

interface CreateOrderUseCaseRequest {
  amountInCents: number;
}

@Injectable()
export class CreateOrderUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({ amountInCents }: CreateOrderUseCaseRequest) {
    const order = Order.create({ amountInCents });

    await this.ordersRepository.create(order);

    return { order };
  }
}
