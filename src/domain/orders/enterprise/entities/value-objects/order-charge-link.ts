import { ValueObject } from '../../../../../core/entities/value-object'

export type PixProvider = 'ABACATEPAY' | 'DELFINANCE'

export interface OrderChargeLinkProps {
  orderId: string
  chargeId: string
  provider: PixProvider
}

export class OrderChargeLink extends ValueObject<OrderChargeLinkProps> {
  private constructor(props: OrderChargeLinkProps) {
    super(props)
  }

  get orderId() {
    return this.props.orderId
  }

  get chargeId() {
    return this.props.chargeId
  }

  get provider() {
    return this.props.provider
  }

  static create(props: OrderChargeLinkProps) {
    if (!props.orderId.trim()) {
      throw new Error('Order id is required.')
    }

    if (!props.chargeId.trim()) {
      throw new Error('Charge id is required.')
    }

    return new OrderChargeLink({ ...props })
  }
}
