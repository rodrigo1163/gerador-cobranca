import { Injectable } from '@nestjs/common';
import { Either, left, right } from '../../../../core/either';
import { BoletoGatewayUnavailableError } from '../errors/boleto-gateway-unavailable-error';
import { InvalidBoletoChargeInputError } from '../errors/invalid-boleto-charge-input-error';
import { InvalidBoletoGatewayResponseError } from '../errors/invalid-boleto-gateway-response-error';
import { InvalidChargeAmountError } from '../errors/invalid-charge-amount-error';
import { OrderNotFoundError } from '../errors/order-not-found-error';
import {
  BoletoGateway,
  CreateBoletoChargeResponse,
} from '../gateways/boleto-gateway';
import { OrderChargeLinksRepository } from '../repositories/order-charge-links-repository';
import { OrdersRepository } from '../repositories/orders-repository';
import { OrderChargeLink } from '../../enterprise/entities/value-objects/order-charge-link';

interface GenerateOrderBoletoUseCaseRequest {
  orderId: string;
  dueDate: string;
}

type GenerateOrderBoletoUseCaseResponse = Either<
  | OrderNotFoundError
  | InvalidBoletoChargeInputError
  | InvalidChargeAmountError
  | InvalidBoletoGatewayResponseError
  | BoletoGatewayUnavailableError,
  {
    boletoCharge: CreateBoletoChargeResponse;
  }
>;

@Injectable()
export class GenerateOrderBoletoUseCase {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly orderChargeLinksRepository: OrderChargeLinksRepository,
    private readonly boletoGateway: BoletoGateway,
  ) {}

  async execute({
    orderId,
    dueDate,
  }: GenerateOrderBoletoUseCaseRequest): Promise<GenerateOrderBoletoUseCaseResponse> {
    if (!orderId.trim()) {
      return left(new InvalidBoletoChargeInputError('Order id is required.'));
    }

    if (!this.isValidDueDate(dueDate)) {
      return left(
        new InvalidBoletoChargeInputError(
          'Due date must be a valid, non-past date in YYYY-MM-DD format.',
        ),
      );
    }

    const order = await this.ordersRepository.findById(orderId);

    if (!order) {
      return left(new OrderNotFoundError());
    }

    if (!order.isValidAmount()) {
      return left(new InvalidChargeAmountError());
    }

    let boletoCharge: CreateBoletoChargeResponse;

    try {
      boletoCharge = await this.boletoGateway.createCharge({
        orderId: order.id.toString(),
        amountInCents: order.amountInCents,
        dueDate,
      });
    } catch (error) {
      if (
        error instanceof InvalidBoletoGatewayResponseError ||
        error instanceof BoletoGatewayUnavailableError ||
        error instanceof InvalidBoletoChargeInputError
      ) {
        return left(error);
      }

      throw error;
    }

    const orderChargeLink = OrderChargeLink.create({
      orderId: order.id.toString(),
      chargeId: boletoCharge.chargeId,
      provider: this.boletoGateway.provider,
      method: 'BOLETO',
    });

    await this.orderChargeLinksRepository.create(orderChargeLink);

    return right({ boletoCharge });
  }

  private isValidDueDate(dueDate: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      return false;
    }

    const [year, month, day] = dueDate.split('-').map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));

    const isCalendarDate =
      parsed.getUTCFullYear() === year &&
      parsed.getUTCMonth() === month - 1 &&
      parsed.getUTCDate() === day;

    if (!isCalendarDate) {
      return false;
    }

    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

    return dueDate >= today;
  }
}
