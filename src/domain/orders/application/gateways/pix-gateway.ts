import { CreateChargeParams } from './payment-gateway';
import { PaymentProvider } from '../../enterprise/entities/value-objects/payment';

export type CreatePixChargeParams = CreateChargeParams;

export interface CreatePixChargeResponse {
  chargeId: string;
  pixCopyPaste: string;
  qrCodeDataUrl: string;
}

export abstract class PixGateway {
  abstract readonly provider: PaymentProvider;

  abstract createCharge(
    params: CreatePixChargeParams,
  ): Promise<CreatePixChargeResponse>;
}
