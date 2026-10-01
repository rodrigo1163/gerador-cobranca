import { UniqueEntityId } from '../../core/entities/unique-entity-id'
import {
  Order,
  OrderProps,
} from '../../domain/orders/enterprise/entities/order'

export function makeOrder(
  override: Partial<OrderProps> = {},
  id?: UniqueEntityId,
) {
  return Order.create(
    {
      amountInCents: 1000,
      ...override,
    },
    id,
  )
}
