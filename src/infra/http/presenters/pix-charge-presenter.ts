import type { CreatePixChargeResponse } from '../../../domain/orders/application/gateways/pix-gateway';

export class PixChargePresenter {
  static toHTTP(pixCharge: CreatePixChargeResponse) {
    return {
      chargeId: pixCharge.chargeId,
      pixCopyPaste: pixCharge.pixCopyPaste,
      qrCodeDataUrl: pixCharge.qrCodeDataUrl,
    };
  }
}
