import { Injectable } from '@nestjs/common';
import { InvalidPixChargeInputError } from '../../../domain/orders/application/errors/invalid-pix-charge-input-error';
import { InvalidPixGatewayResponseError } from '../../../domain/orders/application/errors/invalid-pix-gateway-response-error';
import { PixGatewayUnavailableError } from '../../../domain/orders/application/errors/pix-gateway-unavailable-error';
import {
  CreatePixChargeParams,
  CreatePixChargeResponse,
  PixGateway,
} from '../../../domain/orders/application/gateways/pix-gateway';
import { AbacatePayClient } from './abacate-pay-client';

interface CreateTransparentPixResponse {
  success?: boolean;
  data?: {
    id?: unknown;
    brCode?: unknown;
    brCodeBase64?: unknown;
  } | null;
}

@Injectable()
export class AbacatePayPixGateway extends PixGateway {
  readonly provider = 'ABACATEPAY' as const;

  constructor(private readonly client: AbacatePayClient) {
    super();
  }

  async createCharge({
    orderId,
    amountInCents,
  }: CreatePixChargeParams): Promise<CreatePixChargeResponse> {
    if (amountInCents < 100) {
      throw new InvalidPixChargeInputError(
        'The minimum amount for AbacatePay is 100 cents.',
      );
    }

    let response: CreateTransparentPixResponse;

    try {
      response = await this.client.post<CreateTransparentPixResponse>(
        '/v2/transparents/create',
        {
          method: 'PIX',
          data: {
            amount: amountInCents,
            externalId: orderId,
          },
        },
      );
    } catch {
      throw new PixGatewayUnavailableError();
    }

    if (!response || response.success === false) {
      throw new PixGatewayUnavailableError();
    }

    const { id, brCode, brCodeBase64 } = response.data ?? {};

    if (
      typeof id !== 'string' ||
      !id.trim() ||
      typeof brCode !== 'string' ||
      !brCode.trim() ||
      typeof brCodeBase64 !== 'string' ||
      !brCodeBase64.startsWith('data:image/')
    ) {
      throw new InvalidPixGatewayResponseError();
    }

    return {
      chargeId: id,
      pixCopyPaste: brCode,
      qrCodeDataUrl: brCodeBase64,
    };
  }
}
