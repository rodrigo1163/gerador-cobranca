import { ChargesRepository } from "../../domain/payments/application/repositories/charges-repository"
import { Charge } from "../../domain/payments/enterprise/entities/charge"

export class InMemoryChargeRepository implements ChargesRepository {
  public items: Charge[] = []

  async create(charge: Charge) {
    this.items.push(charge)
  }

  async findById(id: string) {
    const charge = this.items.find((item) => item.id.toString() === id)

    if (!charge) {
      return null
    }

    return charge
  }
}
