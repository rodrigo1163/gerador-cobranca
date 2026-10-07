import { Injectable } from '@nestjs/common';
import { BoletoGatewayUnavailableError } from '../../../domain/orders/application/errors/boleto-gateway-unavailable-error';
import { InvalidBoletoGatewayResponseError } from '../../../domain/orders/application/errors/invalid-boleto-gateway-response-error';
import {
  BoletoGateway,
  CreateBoletoChargeParams,
  CreateBoletoChargeResponse,
} from '../../../domain/orders/application/gateways/boleto-gateway';
import { AsaasClient } from './asaas-client';

interface AsaasCustomerResponse {
  id: string;
}

interface AsaasBoletoPaymentResponse {
  id?: unknown;
  bankSlipUrl?: unknown;
  dueDate?: unknown;
}

interface AsaasBoletoIdentificationResponse {
  identificationField?: unknown;
  barCode?: unknown;
}

@Injectable()
export class AsaasBoletoGateway extends BoletoGateway {
  readonly provider = 'ASAAS' as const;

  constructor(private readonly client: AsaasClient) {
    super();
  }

  async createCharge({
    orderId,
    amountInCents,
    dueDate,
  }: CreateBoletoChargeParams): Promise<CreateBoletoChargeResponse> {
    let payment: AsaasBoletoPaymentResponse;
    let identification: AsaasBoletoIdentificationResponse;

    try {
      const customerId = await this.getCustomerId();

      payment = await this.client.post<AsaasBoletoPaymentResponse>(
        '/payments',
        {
          customer: customerId,
          billingType: 'BOLETO',
          value: amountInCents / 100,
          dueDate,
          externalReference: orderId,
        },
      );

      if (typeof payment?.id !== 'string' || !payment.id.trim()) {
        throw new InvalidBoletoGatewayResponseError();
      }

      identification = await this.client.get<AsaasBoletoIdentificationResponse>(
        `/payments/${payment.id}/identificationField`,
      );
    } catch (error) {
      if (error instanceof InvalidBoletoGatewayResponseError) {
        throw error;
      }

      throw new BoletoGatewayUnavailableError();
    }

    const { id, bankSlipUrl, dueDate: responseDueDate } = payment;
    const { identificationField, barCode } = identification;

    if (
      typeof id !== 'string' ||
      !id.trim() ||
      typeof bankSlipUrl !== 'string' ||
      !bankSlipUrl.trim() ||
      typeof responseDueDate !== 'string' ||
      !responseDueDate.trim() ||
      typeof identificationField !== 'string' ||
      !identificationField.trim() ||
      typeof barCode !== 'string' ||
      !barCode.trim()
    ) {
      throw new InvalidBoletoGatewayResponseError();
    }

    return {
      chargeId: id,
      barcode: barCode,
      digitableLine: identificationField,
      boletoUrl: bankSlipUrl,
      dueDate: responseDueDate,
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
      throw new InvalidBoletoGatewayResponseError();
    }

    return customer.id;
  }
}
