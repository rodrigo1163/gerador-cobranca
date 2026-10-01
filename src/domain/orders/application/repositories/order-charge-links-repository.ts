import { OrderChargeLink } from '../../enterprise/entities/value-objects/order-charge-link'

export { OrderChargeLink } from '../../enterprise/entities/value-objects/order-charge-link'
export type { PixProvider } from '../../enterprise/entities/value-objects/order-charge-link'

export abstract class OrderChargeLinksRepository {
  abstract create(link: OrderChargeLink): Promise<void>
  abstract findByOrderId(orderId: string): Promise<OrderChargeLink | null>
}
