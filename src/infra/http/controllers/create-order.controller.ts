import { Body, Controller, Post } from '@nestjs/common';
import z from 'zod';
import { CreateOrderUseCase } from '../../../domain/orders/application/use-cases/create-order.use-case';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';

const createOrderBodySchema = z.object({
  amountInCents: z.number().int().min(100).max(2_147_483_647),
});

type CreateOrderBodySchema = z.infer<typeof createOrderBodySchema>;

export const bodyValidationPipe = new ZodValidationPipe(createOrderBodySchema);

@Controller('orders')
export class CreateOrderController {
  constructor(private createOrderUseCase: CreateOrderUseCase) {}

  @Post()
  async handle(@Body(bodyValidationPipe) body: CreateOrderBodySchema) {
    const { amountInCents } = body;

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
