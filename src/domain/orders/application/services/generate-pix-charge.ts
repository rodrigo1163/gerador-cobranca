import { PixProvider } from '../repositories/order-charge-links-repository'

export interface GeneratePixChargeParams {
  orderId: string
  amountInCents: number
}

export interface GeneratePixChargeResponse {
  chargeId: string
  pixCopyPaste: string
  qrCodeDataUrl: string
}

export abstract class GeneratePixCharge {
  abstract readonly provider: PixProvider

  abstract execute(
    params: GeneratePixChargeParams,
  ): Promise<GeneratePixChargeResponse>
}
