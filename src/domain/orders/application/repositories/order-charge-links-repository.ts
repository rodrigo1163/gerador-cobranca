import { OrderChargeLink } from '../../enterprise/entities/value-objects/order-charge-link';
import { PaymentMethod } from '../../enterprise/entities/value-objects/payment';

export { OrderChargeLink } from '../../enterprise/entities/value-objects/order-charge-link';
export type {
  PaymentMethod,
  PaymentProvider,
} from '../../enterprise/entities/value-objects/payment';

export abstract class OrderChargeLinksRepository {
  abstract create(link: OrderChargeLink): Promise<void>;
  abstract findByOrderAndMethod(
    orderId: string,
    method: PaymentMethod,
  ): Promise<OrderChargeLink | null>;
}
