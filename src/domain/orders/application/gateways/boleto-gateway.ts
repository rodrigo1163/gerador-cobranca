import { CreateChargeParams } from './payment-gateway';
import { PaymentProvider } from '../../enterprise/entities/value-objects/payment';

export interface CreateBoletoChargeParams extends CreateChargeParams {
  dueDate: string;
}

export interface CreateBoletoChargeResponse {
  chargeId: string;
  barcode: string;
  digitableLine: string;
  boletoUrl: string;
  dueDate: string;
}

export abstract class BoletoGateway {
  abstract readonly provider: PaymentProvider;

  abstract createCharge(
    params: CreateBoletoChargeParams,
  ): Promise<CreateBoletoChargeResponse>;
}
