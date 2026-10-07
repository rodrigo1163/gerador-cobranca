export type {
  PaymentMethod,
  PaymentProvider,
} from '../../enterprise/entities/value-objects/payment';

export interface CreateChargeParams {
  orderId: string;
  amountInCents: number;
}
