import { Entity } from '../../../../core/entities/entity'
import { UniqueEntityId } from '../../../../core/entities/unique-entity-id'

export type OrderStatus = 'PENDING_PAYMENT'

export interface OrderProps {
  amountInCents: number
  status: OrderStatus
}

export class Order extends Entity<OrderProps> {
  get amountInCents() {
    return this.props.amountInCents
  }

  get status() {
    return this.props.status
  }

  static create(
    props: Pick<OrderProps, 'amountInCents'> & Partial<Pick<OrderProps, 'status'>>,
    id?: UniqueEntityId,
  ) {
    if (!Number.isInteger(props.amountInCents) || props.amountInCents <= 0) {
      throw new Error('Order amount must be a positive integer in cents.')
    }

    return new Order(
      {
        amountInCents: props.amountInCents,
        status: props.status ?? 'PENDING_PAYMENT',
      },
      id,
    )
  }
}
