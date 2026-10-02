import { PixProvider } from '../repositories/order-charge-links-repository';

export interface CreatePixChargeParams {
  orderId: string;
  amountInCents: number;
}

export interface CreatePixChargeResponse {
  chargeId: string;
  pixCopyPaste: string;
  qrCodeDataUrl: string;
}

export abstract class PaymentService {
  abstract readonly provider: PixProvider;

  abstract createPixCharge(
    params: CreatePixChargeParams,
  ): Promise<CreatePixChargeResponse>;
}
