import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '../repositories/orders-repository';
import { Order } from '../../enterprise/entities/order';
import { InvalidChargeAmountError } from '../errors/invalid-charge-amount-error';
import { Either, left, right } from '../../../../core/either';

interface CreateOrderUseCaseRequest {
  amountInCents: number;
}

type CreateOrderUseCaseResponse = Either<InvalidChargeAmountError, { order: Order }>;

@Injectable()
export class CreateOrderUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    amountInCents,
  }: CreateOrderUseCaseRequest): Promise<CreateOrderUseCaseResponse> {
    const order = Order.create({ amountInCents });

    if (!order.isValidAmount()) {
      return left(new InvalidChargeAmountError());
    }

    await this.ordersRepository.create(order);

    return right({ order });
  }
}
