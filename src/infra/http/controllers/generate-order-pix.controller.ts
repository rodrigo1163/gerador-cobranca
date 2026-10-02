import {
  BadRequestException,
  BadGatewayException,
  Controller,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { InvalidPixChargeInputError } from '../../../domain/orders/application/errors/invalid-pix-charge-input-error';
import { OrderNotFoundError } from '../../../domain/orders/application/errors/order-not-found-error';
import { InvalidPixGatewayResponseError } from '../../../domain/orders/application/errors/invalid-pix-gateway-response-error';
import { PixGatewayUnavailableError } from '../../../domain/orders/application/errors/pix-gateway-unavailable-error';
import { GenerateOrderPixUseCase } from '../../../domain/orders/application/use-cases/generate-order-pix.use-case';

@Controller('orders')
export class GenerateOrderPixController {
  constructor(private generateOrderPixUseCase: GenerateOrderPixUseCase) {}

  @Post(':orderId/pix')
  async handle(@Param('orderId') orderId: string) {
    const result = await this.generateOrderPixUseCase.execute({ orderId });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case OrderNotFoundError:
          throw new NotFoundException(error.message);
        case InvalidPixGatewayResponseError:
          throw new BadGatewayException(error.message);
        case PixGatewayUnavailableError:
          throw new BadGatewayException(error.message);
        case InvalidPixChargeInputError:
        default:
          throw new BadRequestException(error.message);
      }
    }

    return result.value;
  }
}
