import { Injectable } from '@nestjs/common';
import {
  CreatePixChargeParams,
  CreatePixChargeResponse,
  PaymentService,
} from '../../../domain/orders/application/services/payment-service';
import { AsaasClient } from './asaas-client';
import { InvalidPixGatewayResponseError } from '../../../domain/orders/application/errors/invalid-pix-gateway-response-error';
import { PixGatewayUnavailableError } from '../../../domain/orders/application/errors/pix-gateway-unavailable-error';

interface AsaasPaymentResponse {
  id: string;
}

interface AsaasPixQrCodeResponse {
  payload: string;
  encodedImage: string;
}

// Substitua pelo ID de um cliente cadastrado na sua conta Asaas ao testar cobranças.
const MOCK_ASAAS_CUSTOMER_ID = 'cus_substituir_por_cliente_sandbox';

@Injectable()
export class AsaasPaymentService extends PaymentService {
  readonly provider = 'ASAAS' as const;
  private readonly client = new AsaasClient();

  async createPixCharge({
    orderId,
    amountInCents,
  }: CreatePixChargeParams): Promise<CreatePixChargeResponse> {
    let payment: AsaasPaymentResponse;
    let pix: AsaasPixQrCodeResponse;

    try {
      payment = await this.client.post<AsaasPaymentResponse>('/payments', {
        customer: MOCK_ASAAS_CUSTOMER_ID,
        billingType: 'PIX',
        value: amountInCents / 100,
        dueDate: new Intl.DateTimeFormat('en-CA', {
          timeZone: 'America/Manaus',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(new Date()),
        externalReference: orderId,
      });

      if (!payment?.id) {
        throw new InvalidPixGatewayResponseError();
      }

      pix = await this.client.get<AsaasPixQrCodeResponse>(
        `/payments/${payment.id}/pixQrCode`,
      );
    } catch (error) {
      if (error instanceof InvalidPixGatewayResponseError) {
        throw error;
      }

      throw new PixGatewayUnavailableError();
    }

    if (
      typeof pix?.payload !== 'string' ||
      !pix.payload.trim() ||
      typeof pix.encodedImage !== 'string' ||
      !pix.encodedImage.trim()
    ) {
      throw new InvalidPixGatewayResponseError();
    }

    return {
      chargeId: payment.id,
      pixCopyPaste: pix.payload,
      qrCodeDataUrl: `data:image/png;base64,${pix.encodedImage}`,
    };
  }
}
