import {
  CreatePixChargeParams,
  CreatePixChargeResponse,
  PixGateway,
} from '../../domain/orders/application/gateways/pix-gateway';

export class FakePixGateway extends PixGateway {
  readonly provider = 'ABACATEPAY' as const;
  readonly calls: CreatePixChargeParams[] = [];

  createCharge(
    params: CreatePixChargeParams,
  ): Promise<CreatePixChargeResponse> {
    this.calls.push(params);

    return Promise.resolve({
      chargeId: `charge-${params.orderId}`,
      pixCopyPaste: `pix-${params.orderId}`,
      qrCodeDataUrl: `data:image/png;base64,qr-${params.orderId}`,
    });
  }
}
