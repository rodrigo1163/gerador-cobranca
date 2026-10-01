import { Entity } from "src/core/entities/entity"
import { UniqueEntityId } from "src/core/entities/unique-entity-id"
import { Optional } from "src/core/types/optional"

type ChargeStatus =
  | 'PENDING'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELED'

export interface ChargeProps {
  customerId: string // Quem está sendo cobrado

  amount: number // Valor
  description?: string // Motivo/descrição

  dueDate: Date // Vencimento
  status: ChargeStatus // Estado atual

  paidAt?: Date // Quando foi paga
  canceledAt?: Date // Quando foi cancelada
  createdAt: Date // Quando foi criada
  updatedAt?: Date | null // Última alteração
  externalId: string | null
  paymentUrl: string | null
}

// id: Identificador da cobrança
export class Charge extends Entity<ChargeProps> {
  get customerId() {
    return this.props.customerId
  }
  get amount() {
    return this.props.amount
  }
  get description() {
    return this.props.description
  }
  get dueDate() {
    return this.props.dueDate
  }
  get status() {
    return this.props.status
  }
  get paidAt() {
    return this.props.paidAt
  }
  get canceledAt() {
    return this.props.canceledAt
  }

  get createdAt() {
    return this.props.createdAt
  }
  get updatedAt() {
    return this.props.updatedAt
  }

  get externalId() {
    return this.props.externalId
  }
  get paymentUrl() {
    return this.props.paymentUrl
  }

  set externalId(externalId: string | null) {
    this.props.externalId = externalId
  }

  set paymentUrl(paymentUrl: string | null) {
    this.props.paymentUrl = paymentUrl
  }

  attachPayment(payment: {
    externalId: string
    paymentUrl: string
  }) {
    if (this.props.externalId) {
      throw new Error('Charge already has an external payment')
    }

    this.props.externalId = payment.externalId
    this.props.paymentUrl = payment.paymentUrl

    this.touch()
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<ChargeProps, 'createdAt' | 'status' | 'externalId' | 'paymentUrl'>,
    id?: UniqueEntityId,
  ) {
    const charge = new Charge(
      {
        ...props,
        status: props.status ?? 'PENDING',
        createdAt: props.createdAt ?? new Date(),
        externalId: props.externalId ?? null,
        paymentUrl: props.paymentUrl ?? null,
      },
      id,
    )

    return charge
  }
}
