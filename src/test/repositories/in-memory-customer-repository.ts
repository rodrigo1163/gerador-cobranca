import { CustomersRepository } from "../../domain/payments/application/repositories/customers-repository"
import { Customer } from "../../domain/payments/enterprise/entities/customer"

export class InMemoryCustomerRepository implements CustomersRepository {
  public items: Customer[] = []

  async findById(id: string) {
    const customer = this.items.find((item) => item.id.toString() === id)

    if (!customer) {
      return null
    }

    return customer
  }
}
