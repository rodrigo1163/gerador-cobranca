import { faker } from '@faker-js/faker'
import { UniqueEntityId } from "../../core/entities/unique-entity-id"
import { Customer, CustomerProps } from "../../domain/payments/enterprise/entities/customer"

export function makeCustomer(
  override: Partial<CustomerProps> = {},
  id?: UniqueEntityId,
) {
  const customer = Customer.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      document: faker.string.numeric(11),
      phone: faker.phone.number(),
      ...override,
    },
    id,
  )

  return customer
}
