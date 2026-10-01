import {
  CreateChargeParams,
  CreateChargeResponse,
  PaymentService,
} from '../../domain/payments/application/services/payment-service'

export class FakePaymentService implements PaymentService {
  public createChargeCalls: CreateChargeParams[] = []

  async createCharge(
    params: CreateChargeParams,
  ): Promise<CreateChargeResponse> {
    this.createChargeCalls.push(params)

    return {
      externalId: `fake-${params.orderId}`,
      paymentUrl: `https://fake-payment.test/${params.orderId}`,
      pixCopyPaste: `fake-pix-${params.orderId}`,
      qrCodeDataUrl: `data:image/png;base64,fake-${params.orderId}`,
    }
  }
}
