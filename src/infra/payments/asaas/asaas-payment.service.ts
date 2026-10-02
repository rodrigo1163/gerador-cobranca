import {
  CreatePixChargeParams,
  CreatePixChargeResponse,
  PaymentService,
} from '../../../domain/orders/application/services/payment-service'
import { AsaasClient } from './asaas-client'

interface AsaasPaymentResponse {
  id: string
}

interface AsaasPixQrCodeResponse {
  payload: string
  encodedImage: string
}

export class AsaasPaymentService extends PaymentService {
  readonly provider = 'ASAAS' as const

  constructor(
    private readonly client: AsaasClient,
    private readonly customerId: string,
  ) {
    super()
  }

  async createPixCharge(
    { orderId, amountInCents }: CreatePixChargeParams,
  ): Promise<CreatePixChargeResponse> {
    if (!this.customerId.trim()) {
      throw new Error('Asaas customer ID is required.')
    }

    const payment = await this.client.post<AsaasPaymentResponse>(
      '/payments',
      {
        customer: this.customerId,
        billingType: 'PIX',
        value: amountInCents / 100,
        dueDate: new Date().toISOString().slice(0, 10),
        externalReference: orderId,
      },
    )

    const pix = await this.client.get<AsaasPixQrCodeResponse>(
      `/payments/${payment.id}/pixQrCode`,
    )

    return {
      chargeId: payment.id,
      pixCopyPaste: pix.payload,
      qrCodeDataUrl: `data:image/png;base64,${pix.encodedImage}`,
    }
  }
}
