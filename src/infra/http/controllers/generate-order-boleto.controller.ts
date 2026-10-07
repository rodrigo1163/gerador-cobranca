import {
  BadGatewayException,
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import z from 'zod';
import { BoletoGatewayUnavailableError } from '../../../domain/orders/application/errors/boleto-gateway-unavailable-error';
import { InvalidBoletoChargeInputError } from '../../../domain/orders/application/errors/invalid-boleto-charge-input-error';
import { InvalidBoletoGatewayResponseError } from '../../../domain/orders/application/errors/invalid-boleto-gateway-response-error';
import { InvalidChargeAmountError } from '../../../domain/orders/application/errors/invalid-charge-amount-error';
import { OrderNotFoundError } from '../../../domain/orders/application/errors/order-not-found-error';
import { GenerateOrderBoletoUseCase } from '../../../domain/orders/application/use-cases/generate-order-boleto.use-case';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { BoletoChargePresenter } from '../presenters/boleto-charge-presenter';

const generateBoletoBodySchema = z.object({
  dueDate: z.iso.date(),
});

type GenerateBoletoBodySchema = z.infer<typeof generateBoletoBodySchema>;

export const boletoBodyValidationPipe = new ZodValidationPipe(
  generateBoletoBodySchema,
);

@Controller('orders')
export class GenerateOrderBoletoController {
  constructor(
    private readonly generateOrderBoletoUseCase: GenerateOrderBoletoUseCase,
  ) {}

  @Post(':orderId/boleto')
  async handle(
    @Param('orderId') orderId: string,
    @Body(boletoBodyValidationPipe) body: GenerateBoletoBodySchema,
  ) {
    const result = await this.generateOrderBoletoUseCase.execute({
      orderId,
      dueDate: body.dueDate,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case OrderNotFoundError:
          throw new NotFoundException(error.message);
        case InvalidBoletoGatewayResponseError:
        case BoletoGatewayUnavailableError:
          throw new BadGatewayException(error.message);
        case InvalidChargeAmountError:
        case InvalidBoletoChargeInputError:
        default:
          throw new BadRequestException(error.message);
      }
    }

    return {
      boletoCharge: BoletoChargePresenter.toHTTP(result.value.boletoCharge),
    };
  }
}
