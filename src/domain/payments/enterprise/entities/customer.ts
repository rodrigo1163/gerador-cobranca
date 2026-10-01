import { Entity } from "src/core/entities/entity"
import { UniqueEntityId } from "src/core/entities/unique-entity-id"
import { Optional } from "src/core/types/optional"


interface CustomerProps {
  name: string // Nome/razão social
  document: string // CPF/CNPJ
  email?: string // Contato e eventualmente envio da cobrança
  phone?: string // Contato/WhatsApp
  createdAt: Date // Quando foi cadastrado
  updatedAt?: Date // Última alteração
}


// id: Identificador interno
export class Customer extends Entity<CustomerProps> {
  get name() {
    return this.props.name
  }

  get document() {
    return this.props.document
  }

  get email() {
    return this.props.email
  }

  get phone() {
    return this.props.phone
  }

  get createdAt() {
    return this.props.createdAt
  }
  get updatedAt() {
    return this.props.updatedAt
  }

  static create(
    props: Optional<CustomerProps, 'createdAt'>,
    id?: UniqueEntityId,
  ) {
    const customer = new Customer(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    return customer
  }
}
