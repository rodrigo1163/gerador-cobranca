import {
  PaymentService,
  CreatePixChargeParams,
  CreatePixChargeResponse,
} from '../../domain/orders/application/services/payment-service'

export class FakePaymentService extends PaymentService {
  readonly provider = 'ABACATEPAY' as const
  public calls: CreatePixChargeParams[] = []

  async createPixCharge(
    params: CreatePixChargeParams,
  ): Promise<CreatePixChargeResponse> {
    this.calls.push(params)

    return {
      chargeId: `charge-${params.orderId}`,
      pixCopyPaste: `pix-${params.orderId}`,
      qrCodeDataUrl: `data:image/png;base64,qr-${params.orderId}`,
    }
  }
}
