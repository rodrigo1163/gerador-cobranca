import type { CreatePixChargeResponse } from '../../../domain/orders/application/services/payment-service';

export class PixChargePresenter {
  static toHTTP(pixCharge: CreatePixChargeResponse) {
    return {
      chargeId: pixCharge.chargeId,
      pixCopyPaste: pixCharge.pixCopyPaste,
      qrCodeDataUrl: pixCharge.qrCodeDataUrl,
    };
  }
}
