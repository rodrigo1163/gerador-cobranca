import { Charge } from "../../enterprise/entities/charge"
import { ChargesRepository } from "../repositories/charges-repository"
import { CustomersRepository } from "../repositories/customers-repository"
import { PaymentService } from "../services/payment-service"

interface GenerateChargeRequest {
  customerId: string
  amount: number
  dueDate: Date
  description?: string
}

interface GenerateChargeResponse {
  charge: Charge
}

export class GenerateChargeUseCase {
  constructor(
    private chargesRepository: ChargesRepository,
    private customersRepository: CustomersRepository,
    private paymentService: PaymentService
  ) { }

  async execute({
    customerId,
    amount,
    dueDate,
    description,
  }: GenerateChargeRequest): Promise<GenerateChargeResponse> {

    const customer = await this.customersRepository.findById(customerId)

    if (!customer) {
      throw new Error('Customer not found')
    }

    const charge = Charge.create({
      customerId,
      amount,
      dueDate,
      description,
    })

    const payment = await this.paymentService.createCharge({
      chargeId: charge.id.toString(),
      customer: {
        id: customer.id.toString(),
        name: customer.name,
        document: customer.document,
        email: customer.email,
      },
      amount: charge.amount,
      dueDate: charge.dueDate,
      description: charge.description,
    })

    charge.attachPayment({
      externalId: payment.externalId,
      paymentUrl: payment.paymentUrl,
    })

    await this.chargesRepository.create(charge)

    return { charge }
  }
}