export interface CreateChargeParams {
  orderId: string
  amountInCents: number
}

export interface CreateChargeResponse {
  externalId: string
  paymentUrl: string

  pixCopyPaste: string
  qrCodeDataUrl: string
}

export abstract class PaymentService {
  abstract createCharge(
    params: CreateChargeParams,
  ): Promise<CreateChargeResponse>
}