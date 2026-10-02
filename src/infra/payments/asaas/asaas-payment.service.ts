import { Injectable } from '@nestjs/common';
import {
  CreatePixChargeParams,
  CreatePixChargeResponse,
  PaymentService,
} from '../../../domain/orders/application/services/payment-service';
import { AsaasClient } from './asaas-client';
import { InvalidPixGatewayResponseError } from '../../../domain/orders/application/errors/invalid-pix-gateway-response-error';
import { PixGatewayUnavailableError } from '../../../domain/orders/application/errors/pix-gateway-unavailable-error';

interface AsaasCustomerResponse {
  id: string;
}

interface AsaasPaymentResponse {
  id: string;
}

interface AsaasPixQrCodeResponse {
  payload: string;
  encodedImage: string;
}

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
      const customerId = await this.createCustomer();

      payment = await this.client.post<AsaasPaymentResponse>('/payments', {
        customer: customerId,
        billingType: 'PIX',
        value: amountInCents / 100,
        dueDate: new Intl.DateTimeFormat('en-CA', {
          timeZone: 'America/Sao_Paulo',
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

  private async createCustomer(): Promise<string> {
    const customer = await this.client.post<AsaasCustomerResponse>('/customers', {
      name: 'Teste E2E Gerador Cobranca',
      cpfCnpj: '24971563792',
      notificationDisabled: true,
    });

    if (typeof customer?.id !== 'string' || !customer.id.trim()) {
      throw new InvalidPixGatewayResponseError();
    }

    return customer.id;
  }
}
