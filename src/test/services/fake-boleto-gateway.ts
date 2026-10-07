import {
  BoletoGateway,
  CreateBoletoChargeParams,
  CreateBoletoChargeResponse,
} from '../../domain/orders/application/gateways/boleto-gateway';

export class FakeBoletoGateway extends BoletoGateway {
  readonly provider = 'ASAAS' as const;
  readonly calls: CreateBoletoChargeParams[] = [];

  createCharge(
    params: CreateBoletoChargeParams,
  ): Promise<CreateBoletoChargeResponse> {
    this.calls.push(params);

    return Promise.resolve({
      chargeId: `boleto-${params.orderId}`,
      barcode: `barcode-${params.orderId}`,
      digitableLine: `digitable-${params.orderId}`,
      boletoUrl: `https://sandbox.asaas.com/b/${params.orderId}`,
      dueDate: params.dueDate,
    });
  }
}
