import {
  PaymentService,
  CreatePixChargeParams,
  CreatePixChargeResponse,
} from '../../../domain/orders/application/services/payment-service'
import { InvalidPixGatewayResponseError } from '../../../domain/orders/application/errors/invalid-pix-gateway-response-error'
import { PixGatewayUnavailableError } from '../../../domain/orders/application/errors/pix-gateway-unavailable-error'
import { AbacatePayClient } from './abacate-pay-client'

interface CreateTransparentPixResponse {
  data?: {
    id?: unknown
    brCode?: unknown
    brCodeBase64?: unknown
  } | null
}

export class AbacatePayPaymentService extends PaymentService {
  readonly provider = 'ABACATEPAY' as const

  constructor(private readonly client: AbacatePayClient) {
    super()
  }

  async createPixCharge({ orderId, amountInCents }: CreatePixChargeParams): Promise<CreatePixChargeResponse> {
    let response: CreateTransparentPixResponse

    try {
      response = await this.client.post<CreateTransparentPixResponse>(
        '/v2/transparents/create',
        {
          method: 'PIX',
          data: {
            amount: amountInCents,
            externalId: orderId,
          },
        },
      )
    } catch {
      throw new PixGatewayUnavailableError()
    }

    const { id, brCode, brCodeBase64 } = response?.data ?? {}

    if (
      typeof id !== 'string' || !id.trim() ||
      typeof brCode !== 'string' || !brCode.trim() ||
      typeof brCodeBase64 !== 'string' || !brCodeBase64.startsWith('data:image/')
    ) {
      throw new InvalidPixGatewayResponseError()
    }

    return {
      chargeId: id,
      pixCopyPaste: brCode,
      qrCodeDataUrl: brCodeBase64,
    }
  }
}
