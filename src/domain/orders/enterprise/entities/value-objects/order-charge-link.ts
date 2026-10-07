import { ValueObject } from '../../../../../core/entities/value-object';
import { PaymentMethod, PaymentProvider } from './payment';

export interface OrderChargeLinkProps {
  orderId: string; // Identificador do pedido associado à cobrança.
  chargeId: string; // Identificador da cobrança no provedor de pagamento.
  provider: PaymentProvider; // Provedor de pagamento que criou a cobrança.
  method: PaymentMethod; // Método usado para criar a cobrança.
}

export class OrderChargeLink extends ValueObject<OrderChargeLinkProps> {
  private constructor(props: OrderChargeLinkProps) {
    super(props);
  }

  get orderId() {
    return this.props.orderId;
  }

  get chargeId() {
    return this.props.chargeId;
  }

  get provider() {
    return this.props.provider;
  }

  get method() {
    return this.props.method;
  }

  static create(props: OrderChargeLinkProps) {
    if (!props.orderId.trim()) {
      throw new Error('Order id is required.');
    }

    if (!props.chargeId.trim()) {
      throw new Error('Charge id is required.');
    }

    return new OrderChargeLink({ ...props });
  }
}
