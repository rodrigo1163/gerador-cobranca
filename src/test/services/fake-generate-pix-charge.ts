import {
  GeneratePixCharge,
  GeneratePixChargeParams,
  GeneratePixChargeResponse,
} from '../../domain/orders/application/services/generate-pix-charge'

export class FakeGeneratePixCharge implements GeneratePixCharge {
  readonly provider = 'ABACATEPAY' as const
  public calls: GeneratePixChargeParams[] = []

  async execute(
    params: GeneratePixChargeParams,
  ): Promise<GeneratePixChargeResponse> {
    this.calls.push(params)

    return {
      chargeId: `charge-${params.orderId}`,
      pixCopyPaste: `pix-${params.orderId}`,
      qrCodeDataUrl: `data:image/png;base64,qr-${params.orderId}`,
    }
  }
}
