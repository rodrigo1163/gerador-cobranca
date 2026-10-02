import { Injectable } from '@nestjs/common';
import {
  PaymentService,
  CreatePixChargeParams,
  CreatePixChargeResponse,
} from '../../../domain/orders/application/services/payment-service';
import { InvalidPixGatewayResponseError } from '../../../domain/orders/application/errors/invalid-pix-gateway-response-error';
import { InvalidPixChargeInputError } from '../../../domain/orders/application/errors/invalid-pix-charge-input-error';
import { PixGatewayUnavailableError } from '../../../domain/orders/application/errors/pix-gateway-unavailable-error';
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
export class AbacatePayPaymentService extends PaymentService {
  readonly provider = 'ABACATEPAY' as const;
  private readonly client = new AbacatePayClient();

  async createPixCharge({
    orderId,
    amountInCents,
  }: CreatePixChargeParams): Promise<CreatePixChargeResponse> {
    // A API do AbacatePay exige ao menos R$ 1,00 para cobranças Pix.
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

    const { id, brCode, brCodeBase64 } = response?.data ?? {};

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
