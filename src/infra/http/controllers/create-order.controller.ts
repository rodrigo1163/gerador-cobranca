import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { CreateOrderUseCase } from '../../../domain/orders/application/use-cases/create-order.use-case';

@Controller('orders')
export class CreateOrderController {
  constructor(private createOrderUseCase: CreateOrderUseCase) {}

  @Post()
  async handle(@Body() body?: { amountInCents?: number }) {
    const amountInCents = body?.amountInCents;

    if (
      typeof amountInCents !== 'number' ||
      !Number.isInteger(amountInCents) ||
      amountInCents <= 0 ||
      amountInCents > 2_147_483_647
    ) {
      throw new BadRequestException(
        'amountInCents must be a positive integer up to 2147483647.',
      );
    }

    const { order } = await this.createOrderUseCase.execute({
      amountInCents,
    });

    return {
      order: {
        id: order.id.toString(),
        amountInCents: order.amountInCents,
        status: order.status,
      },
    };
  }
}
