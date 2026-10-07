import { Injectable } from '@nestjs/common';
import { InvalidPixGatewayResponseError } from '../../../domain/orders/application/errors/invalid-pix-gateway-response-error';
import { PixGatewayUnavailableError } from '../../../domain/orders/application/errors/pix-gateway-unavailable-error';
import {
  CreatePixChargeParams,
  CreatePixChargeResponse,
  PixGateway,
} from '../../../domain/orders/application/gateways/pix-gateway';
import { AsaasClient } from './asaas-client';

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
export class AsaasPixGateway extends PixGateway {
  readonly provider = 'ASAAS' as const;

  constructor(private readonly client: AsaasClient) {
    super();
  }

  async createCharge({
    orderId,
    amountInCents,
  }: CreatePixChargeParams): Promise<CreatePixChargeResponse> {
    let payment: AsaasPaymentResponse;
    let pix: AsaasPixQrCodeResponse;

    try {
      const customerId = await this.getCustomerId();

      payment = await this.client.post<AsaasPaymentResponse>('/payments', {
        customer: customerId,
        billingType: 'PIX',
        value: amountInCents / 100,
        dueDate: this.todayInSaoPaulo(),
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

  private async getCustomerId(): Promise<string> {
    const configuredCustomerId = process.env.ASAAS_CUSTOMER_ID?.trim();

    if (configuredCustomerId) {
      return configuredCustomerId;
    }

    const customer = await this.client.post<AsaasCustomerResponse>(
      '/customers',
      {
        name: 'Teste E2E Gerador Cobranca',
        cpfCnpj: '24971563792',
        notificationDisabled: true,
      },
    );

    if (typeof customer?.id !== 'string' || !customer.id.trim()) {
      throw new InvalidPixGatewayResponseError();
    }

    return customer.id;
  }

  private todayInSaoPaulo(): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  }
}
