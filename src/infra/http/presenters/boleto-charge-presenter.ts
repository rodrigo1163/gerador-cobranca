import type { CreateBoletoChargeResponse } from '../../../domain/orders/application/gateways/boleto-gateway';

export class BoletoChargePresenter {
  static toHTTP(boletoCharge: CreateBoletoChargeResponse) {
    return {
      chargeId: boletoCharge.chargeId,
      barcode: boletoCharge.barcode,
      digitableLine: boletoCharge.digitableLine,
      boletoUrl: boletoCharge.boletoUrl,
      dueDate: boletoCharge.dueDate,
    };
  }
}
